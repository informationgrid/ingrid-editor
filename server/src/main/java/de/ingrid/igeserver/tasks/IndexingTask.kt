/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.elasticsearch.IBusIndexManager
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.index.DocumentIndexInfo
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import de.ingrid.utils.ElasticDocument
import jakarta.annotation.PostConstruct
import org.apache.logging.log4j.kotlin.logger
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.elasticsearch.common.Strings
import org.elasticsearch.xcontent.XContentBuilder
import org.elasticsearch.xcontent.XContentFactory
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.data.domain.Page
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.SchedulingConfigurer
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.scheduling.config.ScheduledTaskRegistrar
import org.springframework.scheduling.support.CronTrigger
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.io.IOException
import java.time.OffsetDateTime
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import kotlin.concurrent.schedule


@Component
@Profile("elasticsearch")
class IndexingTask(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val directIndexManager: IndexManager,
    private val iBusIndexManager: IBusIndexManager,
    private val catalogRepo: CatalogRepository,
    @Value("\${elastic.communication.ibus:true}")
    private val indexThroughIBus: Boolean,
    private val codelistService: CodeListService,
    private val postIndexPipe: PostIndexPipe,
    private val generalProperties: GeneralProperties
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()

    private lateinit var indexManager: IIndexManager

    @PostConstruct
    fun init() {
        indexManager = if (indexThroughIBus) iBusIndexManager else directIndexManager
    }

    fun indexByScheduler(catalogId: String, format: String) {
        Timer("ManualIndexing", true).schedule(0) {
            runAsCatalogAdministrator()
            startIndexing(catalogId, format)
        }
    }

    /**
     * Indexing of all published documents into an Elasticsearch index.
     */
    fun startIndexing(catalogId: String, format: String) {
        log.info("Starting Task: Indexing for $catalogId")

        val message = IndexMessage(catalogId)
        notify.sendMessage(message.apply { this.message = "Start Indexing for catalog: $catalogId" })
        val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val partner = codelistService.getCodeListValue("110", catalog.settings?.config?.partner, "ident")
        val provider = codelistService.getCodeListValue("111", catalog.settings?.config?.provider, "ident")
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
        // make sure the ingrid_meta index is there
        indexManager.checkAndCreateInformationIndex()

        run indexingLoop@{
            categories.forEach categoryLoop@{ category ->
                val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)

                val exporter = try {
                    indexService.getExporter(category, format)
                } catch (ex: ConfigurationException) {
                    log.debug("No exporter defined for '${format}' and category '${category.value}'")
                    // add plugdescription for correct usage in iBus, since data and address index have the same
                    // plugId, both need the plugdescription info
                    val plugInfo =
                        IPlugInfo(elasticsearchAlias, null, "none", category.value, partner, provider, catalog)
                    updateIBusInformation(plugInfo)
                    return@categoryLoop
                }

                log.info("Indexing category: " + category.value)

                // pre phase
                val info = try {
                    indexPrePhase(categoryAlias, catalogProfile, format, elasticsearchAlias, category)
                } catch (ex: Exception) {
                    notify.addAndSendMessageError(message, ex, "Error during Index Pre-Phase: ")
                    return@categoryLoop // throw ServerException.withReason("Error in Index Pre-Phase + ${ex.message}")
                }

                // TODO: configure index name
                val indexInfo = IndexInfo().apply {
                    realIndexName = info.second
                    toType = if (category == DocumentCategory.ADDRESS) "address" else "base"
                    toAlias = categoryAlias
                    docIdField = if (category == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address else catalogProfile.indexIdField.document
                }

                var page = -1
                val totalHits: Long = indexService.getNumberOfPublishableDocuments(catalogId, category.value, catalogProfile)
                updateMessageWithDocumentInfo(message, category, totalHits)

                try {
                    do {
                        page++
                        val docsToPublish = indexService.getPublishedDocuments(catalogId, category.value, catalogProfile, page, totalHits)
                        // isLast function sometimes delivers the next to last page without a total count, so we write our own
                        val isLast =
                            (page * generalProperties.indexPageSize + docsToPublish.numberOfElements).toLong() == totalHits

                        exportDocuments(docsToPublish, catalogId, message, category, page, exporter, indexInfo)
                    } while (!isLast)

                    notify.sendMessage(message.apply { this.message = "Post Phase" })

                    // post phase
                    val plugInfo = IPlugInfo(
                        elasticsearchAlias,
                        info.first,
                        info.second,
                        category.value,
                        partner,
                        provider,
                        catalog
                    )
                    indexPostPhase(plugInfo)
                    log.debug("Task finished: Indexing for $catalogId")

                } catch (ex: IndexException) {
                    log.info("Indexing was cancelled")
                    removeOldIndices(info.first)
                    return@indexingLoop
                } catch (ex: Exception) {
                    notify.addAndSendMessageError(message, ex, "Error during indexing: ")
                }
            }
        }

        // make sure to write everything to elasticsearch
        // if another indexing starts right afterwards, then the previous index could still be there
        indexManager.flush()

        log.info("Indexing finished")
        notify.sendMessage(message.apply {
            this.endTime = Date()
            this.message = "Indexing finished"
        })

        // save last indexing information to database for this catalog to get this in frontend
        updateIndexLog(catalogId, message)

    }

    private fun updateMessageWithDocumentInfo(
        message: IndexMessage,
        category: DocumentCategory,
        totalHits: Long
    ) {
        if (category == DocumentCategory.DATA) {
            message.numDocuments = totalHits.toInt()
        } else {
            message.numAddresses = totalHits.toInt()
        }
    }

    private fun exportDocuments(
        docsToPublish: Page<DocumentIndexInfo>,
        catalogId: String,
        message: IndexMessage,
        category: DocumentCategory,
        page: Int,
        exporter: IgeExporter,
        indexInfo: IndexInfo
    ) {
        val profile = catalogService.getProfileFromCatalog(catalogId).identifier

        docsToPublish.content
            .mapIndexedNotNull { index, doc ->
                handleCancelation(catalogId, message)
                sendNotification(category, message, index + (page * generalProperties.indexPageSize))
                log.debug("export ${doc.document.uuid}")
                try {
                    Pair(doc, exporter.run(doc.document, catalogId))
                } catch (ex: Exception) {
                    if (ex is IndexException && ex.errorCode == "FOLDER_WITH_NO_CHILDREN") {
                        log.debug("Ignore folder with to published datasets: ${ex.message}")
                    } else {
                        val errorMessage =
                            "Error exporting document '${doc.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
                        log.error(errorMessage, ex)
                        message.errors.add(errorMessage)
                        sendNotification(category, message, index + (page * generalProperties.indexPageSize))
                    }
                    null
                }
            }
            .onEach { (docInfo, exportedDoc) ->
                try {
                    val elasticDocument = convertToElasticDocument(exportedDoc)
                    index(docInfo, indexInfo, elasticDocument)
                    val simpleContext = SimpleContext(catalogId, profile, docInfo.document.uuid)
                    postIndexPipe.runFilters(PostIndexPayload(elasticDocument, category.name, exporter.typeInfo.type), simpleContext)
                } catch (ex: Exception) {
                    val errorMessage =
                        "Error in PostIndexFilter or during sending to Elasticsearch: '${docInfo.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
                    log.error(errorMessage, ex)
                    message.errors.add(errorMessage)
                    notify.sendMessage(message)
                }
            }
    }

    private fun getElasticsearchAliasFromCatalog(catalog: Catalog) =
        catalog.settings?.config?.elasticsearchAlias ?: catalog.identifier

    private fun updateIndexLog(
        catalogId: String,
        message: IndexMessage
    ) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        if (catalog.settings == null) {
            catalog.settings = CatalogSettings(lastLogSummary = message)
        } else {
            catalog.settings?.lastLogSummary = message
        }
        catalog.modified = OffsetDateTime.now()
        catalogRepo.save(catalog)
    }

    private fun handleCancelation(catalogId: String, message: IndexMessage) {

        if (this.cancellations[catalogId] == true) {
            this.cancellations[catalogId] = false
            notify.sendMessage(message.apply {
                this.endTime = Date()
                this.errors.add("Indexing cancelled")
            })
            throw IndexException.wasCancelled()
        }

    }

    private fun sendNotification(
        category: DocumentCategory,
        message: IndexMessage,
        index: Int
    ) {
        if (category == DocumentCategory.DATA) {
            notify.sendMessage(message.apply {
                this.progressDocuments = index + 1
                this.progress = (((this.progressDocuments + 0f) / this.numDocuments) * 100).toInt()
            })
        } else {
            notify.sendMessage(message.apply {
                this.progressAddresses = index + 1
                this.progress = (((this.progressAddresses + 0f) / this.numDocuments) * 100).toInt()
            })
        }
    }

    /**
     * Indexing of a single document into an Elasticsearch index.
     */
    fun updateDocument(catalogId: String, category: DocumentCategory, docId: String) {
        log.info("Export dataset to Elasticsearch: $catalogId/$docId")

        runAsCatalogAdministrator()

        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
        val exportFormatId = catalogProfile.indexExportFormatID
        val exporter = indexService.getExporter(category, exportFormatId)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)

        try {
            val doc = indexService.getSinglePublishedDocument(catalogId, category.value, catalogProfile, docId)

            val export = exporter.run(doc.document, catalogId)
            log.debug("Exported document: $export")
            val indexInfo = getOrPrepareIndex(catalogProfile, category, exportFormatId, elasticsearchAlias)


            val elasticDoc = convertToElasticDocument(export)
            postIndexPipe.runFilters(PostIndexPayload(elasticDoc, category.name, exporter.typeInfo.type), SimpleContext(catalogId, catalogProfile.identifier, docId))

            index(doc, indexInfo, elasticDoc)
            log.info("$catalogId/$docId updated in index: ${indexInfo.realIndexName}")
        } catch (ex: NoSuchElementException) {
            log.info("Document not indexed, probably because of profile specific condition: $catalogId -> $docId")
        }
    }

    private fun index(
        doc: DocumentIndexInfo,
        indexInfo: IndexInfo,
        elasticDoc: ElasticDocument
    ) {
        if (indexThroughIBus) {
            doc.iBusIndex?.forEach {
                (indexManager as IBusIndexManager).update(it, indexInfo, elasticDoc, false)
            }
        } else {
            indexManager.update(indexInfo, elasticDoc, false)
        }
    }

    private fun getOrPrepareIndex(
        catalogProfile: CatalogProfile,
        category: DocumentCategory,
        format: String,
        elasticsearchAlias: String
    ): IndexInfo {
        val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)
        var oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        if (oldIndex == null) {
            val (_, newIndex) = indexPrePhase(categoryAlias, catalogProfile, format, elasticsearchAlias, category)
            oldIndex = newIndex
            indexManager.switchAlias(elasticsearchAlias, null, newIndex)
        }

        return IndexInfo().apply {
            realIndexName = oldIndex
            toType = if (category == DocumentCategory.ADDRESS) "address" else "base"
            toAlias = elasticsearchAlias
            docIdField = if (category == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address else catalogProfile.indexIdField.document
        }
    }

    private fun getIndexIdentifier(
        elasticsearchAlias: String,
        category: DocumentCategory
    ) = "${elasticsearchAlias}_${category.value}"

    private fun convertToElasticDocument(doc: Any): ElasticDocument {

        return jacksonObjectMapper()
//            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature())
            .readValue(doc as String, ElasticDocument::class.java)

    }


    private fun indexPrePhase(
        categoryAlias: String,
        catalogProfile: CatalogProfile,
        format: String,
        elasticsearchAlias: String,
        category: DocumentCategory
    ): Pair<String, String> {
        val oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        val newIndex = IndexManager.getNextIndexName(categoryAlias, generalProperties.uuid, elasticsearchAlias)
        indexManager.createIndex(
            newIndex,
            if (category == DocumentCategory.ADDRESS) "address" else "base",
            catalogProfile.getElasticsearchMapping(format),
            catalogProfile.getElasticsearchSetting(format)
        )
        return Pair(oldIndex, newIndex)
    }

    private fun indexPostPhase(info: IPlugInfo) {

        // update central index with iPlug information
        updateIBusInformation(info)

        // switch alias and delete old index
        indexManager.switchAlias(info.alias, info.oldIndex, info.newIndex)
        removeOldIndices(info.newIndex)
    }

    private fun updateIBusInformation(info: IPlugInfo) {
        val plugIdInfo = "ige-ng:${info.alias}:${info.category}"
        indexManager.updateIPlugInformation(
            plugIdInfo,
            getIPlugInfo(plugIdInfo, info.newIndex, false, null, null, info.partner, info.provider, info.catalog, info.category == "address")
        )
    }

    @Throws(IOException::class)
    private fun getIPlugInfo(
        infoId: String,
        indexName: String,
        running: Boolean,
        count: Int?,
        totalCount: Int?,
        partner: String?,
        provider: String?,
        catalog: Catalog,
        forAddress: Boolean
    ): String? {

        val plugId = "ige-ng_${catalog.identifier}"
        val xContentBuilder: XContentBuilder = XContentFactory.jsonBuilder().startObject()
            .field("plugId", plugId)
            .field("indexId", infoId)
            .field("iPlugName", prepareIPlugName(infoId))
            .field("linkedIndex", indexName)
            .field("linkedType", if (forAddress) "address" else "base")
            .field("adminUrl", generalProperties.host)
            .field("lastHeartbeat", Date())
            .field("lastIndexed", Date())
            .field("plugdescription", settingsService.getPlugDescription(partner, provider, plugId, forAddress, catalog.name))
            .startObject("indexingState")
            .field("numProcessed", count)
            .field("totalDocs", totalCount)
            .field("running", running)
            .endObject()
            .endObject()
        return Strings.toString(xContentBuilder)
    }

    private fun prepareIPlugName(infoId: String): String {
        val splitted = infoId.split(":")
        return "IGE-NG (${splitted[1]}:${splitted[2]})"
    }

    private fun removeOldIndices(newIndex: String) {
        val delimiterPos = newIndex.lastIndexOf("_")
        val indexGroup = newIndex.substring(0, delimiterPos + 1)
        val indices: Array<String> = indexManager.getIndices(indexGroup)
        for (indexToDelete in indices) {
            if (indexToDelete != newIndex) {
                indexManager.deleteIndex(indexToDelete)
            }
        }
    }

    // check out here: https://stackoverflow.com/questions/39152599/interrupt-spring-scheduler-task-before-next-invocation
    override fun configureTasks(taskRegistrar: ScheduledTaskRegistrar) {

        Timer("IgeTasks", false).schedule(10000) {
            // get index configurations from all catalogs
            getIndexConfigurations()
                .filter { it.cron.isNotEmpty() }
                .forEach { config ->
                    val future = addSchedule(config)
                    config.future = future
                    scheduledFutures.add(config)
                }
        }

    }

    private fun addSchedule(config: IndexConfig): ScheduledFuture<*>? {
        val trigger = CronTrigger(config.cron)
        return scheduler.schedule({
            runAsCatalogAdministrator()
            startIndexing(config.catalogId, config.exportFormat)
        }, trigger)
    }

    private fun runAsCatalogAdministrator() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

    fun updateTaskTrigger(config: IndexConfigOptions) {

        val schedule = scheduledFutures.find { it.catalogId == config.catalogId }
        schedule?.future?.cancel(false)
        scheduledFutures.remove(schedule)
        if (config.cronPattern.isEmpty()) {
            log.info("Indexing Task for '${config.catalogId}' disabled")
        } else {
            val indexConfig = IndexConfig(config.catalogId, config.exportFormat, config.cronPattern)
            val newFuture = addSchedule(indexConfig)
            indexConfig.future = newFuture
            scheduledFutures.add(indexConfig)
            log.info("Indexing Task for '${config.catalogId}' rescheduled")
        }

    }

    private fun getIndexConfigurations(): List<IndexConfig> {

        return catalogRepo.findAll().mapNotNull { getConfigFromDatabase(it) }

    }

    private fun getConfigFromDatabase(catalog: Catalog): IndexConfig? {

        val settings = catalog.settings
        return if (settings?.indexCronPattern == null || settings.exportFormat == null) {
            null
        } else {
            IndexConfig(catalog.identifier, settings.exportFormat!!, settings.indexCronPattern!!)
        }

    }

    override fun destroy() {
        executor.shutdownNow()
    }

    private fun initScheduler(): TaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 10
        scheduler.afterPropertiesSet()
        return scheduler
    }

    fun cancelIndexing(catalogId: String) {
        this.cancellations[catalogId] = true
    }

    fun removeFromIndex(catalogId: String, id: String, category: String) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val enumCategory = DocumentCategory.values().first {it.value == category}
        val categoryAlias = getIndexIdentifier(elasticsearchAlias, enumCategory)
        try {
            val oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
            val info = IndexInfo().apply {
                realIndexName = oldIndex
                toType = if (category == "address") "address" else "base"
                toAlias = elasticsearchAlias
            }

            if (oldIndex != null && indexManager.indexExists(oldIndex)) {
                indexManager.delete(info, id, true)
            }
        } catch (ex: NoNodeAvailableException) {
            throw NoElasticsearchConnectionException.withReason(ex.message ?: "No connection to Elasticsearch")
        }
    }

}

data class IndexConfig(
    val catalogId: String,
    val exportFormat: String,
    val cron: String,
    var future: ScheduledFuture<*>? = null,
    val onStartup: Boolean = false
)

data class IPlugInfo(
    val alias: String,
    val oldIndex: String?,
    val newIndex: String,
    val category: String,
    val partner: String?,
    val provider: String?,
    val catalog: Catalog
)
