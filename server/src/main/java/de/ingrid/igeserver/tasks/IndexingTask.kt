/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European
 * Commission - subsequent versions of the EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence. You may obtain a copy of the
 * Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence
 * is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the Licence for the specific language governing permissions and limitations under
 * the Licence.
 */
package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.index.*
import de.ingrid.igeserver.model.IndexCronOptions
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.DisposableBean
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
import java.time.format.DateTimeFormatter
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import kotlin.concurrent.schedule

data class ExtendedExporterConfig(
    val target: IIndexManager,
    val exporterData: IgeExporter?,
    val exporterAddress: IgeExporter?,
    val tags: List<String>
)

@Component
@Profile("elasticsearch")
class IndexingTask(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val iBusIndexManager: IBusIndexManager,
    private val catalogRepo: CatalogRepository,
    private val codelistService: CodeListService,
    private val postIndexPipe: PostIndexPipe,
    private val generalProperties: GeneralProperties
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()

    fun indexByScheduler(catalogId: String) {
        Timer("ManualIndexing", true).schedule(0) {
            runAsCatalogAdministrator()
            startIndexing(catalogId)
        }
    }

    /** Indexing of all published documents into an Elasticsearch index. */
    fun startIndexing(catalogId: String) {
        log.info("Starting Task: Indexing for $catalogId")

        val message = IndexMessage(catalogId)
        notify.sendMessage(
            message.apply { this.message = "Start Indexing for catalog: $catalogId" }
        )
        val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        //        val format = catalog.settings.exports.map { it.exporterId }.firstOrNull() ?: "???"
        // TODO: prepare iPlugInfo in separate function (to contain partner, provider and other non
        // changing things)
        val partner =
            codelistService.getCodeListValue("110", catalog.settings.config.partner, "ident")
        val provider =
            codelistService.getCodeListValue("111", catalog.settings.config.provider, "ident")
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)

        // get all targets we want to export to
        val targets = getExporterConfigForCatalog(catalog)

        // make sure the ingrid_meta index is there
        handleInformationIndex(targets)
        //        val indexManager = config[0].target

        run indexingLoop@{
            targets.forEach { target ->
                categories.forEach categoryLoop@{ category ->
                    val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)

                    log.info("Indexing to target '${target}' in category: " + category.value)

                    // pre phase
                    val (oldIndex, newIndex) = try {
                        indexPrePhase(
                            target,
                            categoryAlias,
                            catalogProfile,
                            "IGNORED",
                            elasticsearchAlias,
                            category
                        )
                    } catch (ex: Exception) {
                        notify.addAndSendMessageError(
                            message,
                            ex,
                            "Error during Index Pre-Phase: "
                        )
                        return@categoryLoop // throw ServerException.withReason("Error in Index
                        // Pre-Phase +
                        // ${ex.message}")
                    }

                    // TODO: configure index name
                    val indexInfo =
                        IndexInfo(
                            newIndex,
                            if (category == DocumentCategory.ADDRESS) "address" else "base",
                            categoryAlias,
                            if (category == DocumentCategory.ADDRESS)
                                catalogProfile.indexIdField.address
                            else catalogProfile.indexIdField.document
                        )

                    var page = -1
                    val totalHits: Long =
                        indexService.getNumberOfPublishableDocuments(
                            catalogId,
                            category.value,
                            target.tags,
                            catalogProfile
                        )
                    updateMessageWithDocumentInfo(message, category, totalHits)

                    try {
                        do {
                            page++
                            val docsToPublish =
                                indexService.getPublishedDocuments(
                                    catalogId,
                                    category.value,
                                    target.tags,
                                    catalogProfile,
                                    page,
                                    totalHits
                                )
                            // isLast function sometimes delivers the next to last page without a
                            // total
                            // count, so we
                            // write our own
                            val isLast =
                                (page * generalProperties.indexPageSize +
                                        docsToPublish.numberOfElements)
                                    .toLong() == totalHits

                            exportDocuments(
                                target,
                                docsToPublish,
                                catalogId,
                                message,
                                category,
                                page,
                                indexInfo
                            )
                        } while (!isLast)

                        notify.sendMessage(message.apply { this.message = "Post Phase" })

                        // post phase
                        val plugInfo =
                            IPlugInfo(
                                elasticsearchAlias,
                                oldIndex,
                                newIndex,
                                category.value,
                                partner,
                                provider,
                                catalog
                            )
                        indexPostPhase(target, plugInfo)
                        log.debug("Task finished: Indexing for $catalogId")
                    } catch (ex: IndexException) {
                        log.info("Indexing was cancelled")
                        removeOldIndices(target, oldIndex)
                        return@indexingLoop
                    } catch (ex: Exception) {
                        notify.addAndSendMessageError(message, ex, "Error during indexing: ")
                    }
                }
            }
        }

        // make sure to write everything to elasticsearch
        // if another indexing starts right afterwards, then the previous index could still be there
        targets.forEach { it.target.flush() }

        log.info("Indexing finished")
        notify.sendMessage(
            message.apply {
                this.endTime = Date()
                this.message = "Indexing finished"
            }
        )

        // save last indexing information to database for this catalog to get this in frontend
        updateIndexLog(catalogId, message)
    }

    private fun handleInformationIndex(configs: List<ExtendedExporterConfig>) {
        configs.forEach { it.target.checkAndCreateInformationIndex() }
    }

    private fun getExporterConfigForCatalog(catalog: Catalog): List<ExtendedExporterConfig> {
        val ibusConfigs = settingsService.getIBusConfig()
        val elasticConfig = settingsService.getElasticConfig()

        return catalog.settings.exports.mapNotNull { config ->
            val ibus = ibusConfigs.find { it.id!! == config.target }
            val elastic = elasticConfig.find { it.id!! == config.target }
            if (ibus == null && elastic == null) {
                val msg = "An exporter configuration contains invalid target: ${config.target}"
                log.error(msg)
                notify.addAndSendMessageError(
                    IndexMessage(catalog.identifier),
                    ServerException.withReason(msg)
                )
                return@mapNotNull null
            }

            val target =
                if (ibus != null) {
                    IBusIndexer(iBusIndexManager, ibusConfigs.indexOf(ibus))
                } else ElasticIndexer(elasticConfig.indexOf(elastic))

            ExtendedExporterConfig(
                target,
                getExporterOrNull(DocumentCategory.DATA, config.exporterId),
                getExporterOrNull(DocumentCategory.ADDRESS, config.exporterId),
                config.tags
            )
        }
    }

    private fun getExporterOrNull(category: DocumentCategory, exporterId: String): IgeExporter? {
        return try {
            indexService.getExporter(category, exporterId)
        } catch (e: ConfigurationException) {
            null
        }
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
        target: ExtendedExporterConfig,
        docsToPublish: Page<DocumentIndexInfo>,
        catalogId: String,
        message: IndexMessage,
        category: DocumentCategory,
        page: Int,
        indexInfo: IndexInfo
    ) {
        val profile = catalogService.getProfileFromCatalog(catalogId).identifier

        docsToPublish.content
            .mapIndexedNotNull { index, doc ->
                handleCancelation(catalogId, message)
                sendNotification(
                    category,
                    message,
                    index + (page * generalProperties.indexPageSize)
                )
                log.debug("export ${doc.document.uuid}")
                val exportedDocs =
                    try {
                        val exporter =
                            if (category == DocumentCategory.DATA) target.exporterData
                            else target.exporterAddress
                        // an exporter might not exist for a category
                        if (exporter == null) return@mapIndexedNotNull null

                        doc.exporterType = exporter.typeInfo.type

                        exporter.run(doc.document, catalogId)
                    } catch (ex: Exception) {
                        if (ex is IndexException && ex.errorCode == "FOLDER_WITH_NO_CHILDREN") {
                            log.debug("Ignore folder with to published datasets: ${ex.message}")
                        } else {
                            val errorMessage =
                                "Error exporting document '${doc.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
                            log.error(errorMessage, ex)
                            message.errors.add(errorMessage)
                            sendNotification(
                                category,
                                message,
                                index + (page * generalProperties.indexPageSize)
                            )
                        }
                        null
                    }
                Pair(doc, exportedDocs)
            }
            .onEach { pair ->
                val (docInfo, exportedDoc) = pair
                try {
                    val elasticDocument = convertToElasticDocument(exportedDoc!!)
                    index(target, indexInfo, elasticDocument)
                    val simpleContext = SimpleContext(catalogId, profile, docInfo.document.uuid)

                    postIndexPipe.runFilters(
                        PostIndexPayload(elasticDocument, category.name, docInfo.exporterType!!),
                        simpleContext
                    )
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
        catalog.settings.config.elasticsearchAlias ?: catalog.identifier

    private fun updateIndexLog(catalogId: String, message: IndexMessage) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        catalog.settings.lastLogSummary = message
        catalog.modified = OffsetDateTime.now()
        catalogRepo.save(catalog)
    }

    private fun handleCancelation(catalogId: String, message: IndexMessage) {

        if (this.cancellations[catalogId] == true) {
            this.cancellations[catalogId] = false
            notify.sendMessage(
                message.apply {
                    this.endTime = Date()
                    this.errors.add("Indexing cancelled")
                }
            )
            throw IndexException.wasCancelled()
        }
    }

    private fun sendNotification(category: DocumentCategory, message: IndexMessage, index: Int) {
        if (category == DocumentCategory.DATA) {
            notify.sendMessage(
                message.apply {
                    this.progressDocuments = index + 1
                    this.progress =
                        (((this.progressDocuments + 0f) / this.numDocuments) * 100).toInt()
                }
            )
        } else {
            notify.sendMessage(
                message.apply {
                    this.progressAddresses = index + 1
                    this.progress =
                        (((this.progressAddresses + 0f) / this.numDocuments) * 100).toInt()
                }
            )
        }
    }

    /** Indexing of a single document into an Elasticsearch index. */
    fun updateDocument(
        catalogId: String,
        category: DocumentCategory,
        format: String,
        docId: String
    ) {
        log.info("Export dataset to Elasticsearch: $catalogId/$docId")

        runAsCatalogAdministrator()

        val exporter = indexService.getExporter(category, format)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val configs = getExporterConfigForCatalog(catalog)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)

        try {
            val doc =
                indexService.getSinglePublishedDocument(
                    catalogId,
                    category.value,
                    configs[0].tags,
                    catalogProfile,
                    docId
                )

            // TODO: loop through all configurations!
            val export = exporter.run(doc.document, catalogId)
            log.debug("Exported document: $export")
            val indexInfo =
                getOrPrepareIndex(configs[0], catalogProfile, category, format, elasticsearchAlias)

            val elasticDoc = convertToElasticDocument(export)
            postIndexPipe.runFilters(
                PostIndexPayload(elasticDoc, category.name, exporter.typeInfo.type),
                SimpleContext(catalogId, catalogProfile.identifier, docId)
            )

            index(configs[0], indexInfo, elasticDoc)
            log.info("$catalogId/$docId updated in index: ${indexInfo.getRealIndexName()}")
        } catch (ex: NoSuchElementException) {
            log.info(
                "Document not indexed, probably because of profile specific condition: $catalogId -> $docId"
            )
        }
    }

    private fun index(
        config: ExtendedExporterConfig,
        indexInfo: IndexInfo,
        elasticDoc: ElasticDocument
    ) {
        if (config.target is IBusIndexManager) {
            config.target.update(indexInfo, elasticDoc, false)
        } else {
            config.target.update(indexInfo, elasticDoc, false)
        }
    }

    private fun getOrPrepareIndex(
        exporter: ExtendedExporterConfig,
        catalogProfile: CatalogProfile,
        category: DocumentCategory,
        format: String,
        elasticsearchAlias: String
    ): IndexInfo {
        val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)
        var oldIndex = exporter.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        if (oldIndex == null) {
            val (_, newIndex) =
                indexPrePhase(
                    exporter,
                    categoryAlias,
                    catalogProfile,
                    format,
                    elasticsearchAlias,
                    category
                )
            oldIndex = newIndex
            exporter.target.switchAlias(elasticsearchAlias, null, newIndex)
        }

        return IndexInfo(
            oldIndex,
            if (category == DocumentCategory.ADDRESS) "address" else "base",
            elasticsearchAlias,
            if (category == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address
            else catalogProfile.indexIdField.document
        )
    }

    private fun getIndexIdentifier(elasticsearchAlias: String, category: DocumentCategory) =
        "${elasticsearchAlias}_${category.value}"

    private fun convertToElasticDocument(doc: Any): ElasticDocument {
        return jacksonObjectMapper().readValue(doc.toString(), ElasticDocument::class.java)
    }

    private fun indexPrePhase(
        exporter: ExtendedExporterConfig,
        categoryAlias: String,
        catalogProfile: CatalogProfile,
        format: String,
        elasticsearchAlias: String,
        category: DocumentCategory
    ): Pair<String?, String> {
        val newIndex =
            IndexService.getNextIndexName(
                categoryAlias,
                generalProperties.uuid,
                elasticsearchAlias
            )

        val oldIndex = exporter.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        exporter.target.createIndex(
            newIndex,
            if (category == DocumentCategory.ADDRESS) "address" else "base",
            catalogProfile.getElasticsearchMapping(format),
            catalogProfile.getElasticsearchSetting(format)
        )
        return Pair(oldIndex, newIndex)
    }

    private fun indexPostPhase(config: ExtendedExporterConfig, info: IPlugInfo) {
        // update central index with iPlug information
        updateIBusInformation(config, info)

        // switch alias and delete old index
        config.target.switchAlias(info.alias, info.oldIndex, info.newIndex)
        removeOldIndices(config, info.newIndex)
    }

    private fun updateIBusInformation(config: ExtendedExporterConfig, info: IPlugInfo) {
        val plugIdInfo = "ige-ng:${info.alias}:${info.category}"
        config.target.updateIPlugInformation(
            plugIdInfo,
            getIPlugInfo(
                plugIdInfo,
                info.newIndex,
                false,
                null,
                null,
                info.partner,
                info.provider,
                info.catalog,
                info.category == "address"
            )
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
    ): String {

        val plugId = "ige-ng_${catalog.identifier}"
        val currentDate = OffsetDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)

        return jacksonObjectMapper()
            .createObjectNode()
            .apply {
                put("plugId", plugId)
                put("indexId", infoId)
                put("iPlugName", prepareIPlugName(infoId))
                put("linkedIndex", indexName)
                put("linkedType", if (forAddress) "address" else "base")
                put("adminUrl", generalProperties.host)
                put("lastHeartbeat", currentDate)
                put("lastIndexed", currentDate)
                set<JsonNode>(
                    "plugdescription",
                    jacksonObjectMapper()
                        .convertValue(
                            settingsService.getPlugDescription(
                                partner,
                                provider,
                                plugId,
                                forAddress,
                                catalog.name
                            ),
                            JsonNode::class.java
                        )
                )
                set<JsonNode>(
                    "indexingState",
                    jacksonObjectMapper().createObjectNode().apply {
                        put("numProcessed", count)
                        put("totalDocs", totalCount)
                        put("running", running)
                    }
                )
            }
            .toString()
    }

    private fun prepareIPlugName(infoId: String): String {
        val splitted = infoId.split(":")
        return "IGE-NG (${splitted[1]}:${splitted[2]})"
    }

    private fun removeOldIndices(config: ExtendedExporterConfig, index: String?) {
        if (index == null) return

        val delimiterPos = index.lastIndexOf("_")
        val indexGroup = index.substring(0, delimiterPos + 1)

        val indices: Array<String> = config.target.getIndices(indexGroup)
        for (indexToDelete in indices) {
            if (indexToDelete != index) {
                config.target.deleteIndex(indexToDelete)
            }
        }
    }

    // check out here:
    // https://stackoverflow.com/questions/39152599/interrupt-spring-scheduler-task-before-next-invocation
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
        return scheduler.schedule(
            {
                runAsCatalogAdministrator()
                startIndexing(config.catalogId)
            },
            trigger
        )
    }

    private fun runAsCatalogAdministrator() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "Scheduler",
                "Task",
                listOf(SimpleGrantedAuthority("cat-admin"))
            )
        SecurityContextHolder.getContext().authentication = auth
    }

    fun updateTaskTrigger(catalogId: String, config: IndexCronOptions) {

        val schedule = scheduledFutures.find { it.catalogId == catalogId }
        schedule?.future?.cancel(false)
        scheduledFutures.remove(schedule)
        if (config.cronPattern.isEmpty()) {
            log.info("Indexing Task for '${catalogId}' disabled")
        } else {
            val indexConfig = IndexConfig(catalogId, "IGNORE", config.cronPattern)
            val newFuture = addSchedule(indexConfig)
            indexConfig.future = newFuture
            scheduledFutures.add(indexConfig)
            log.info("Indexing Task for '${catalogId}' rescheduled")
        }
    }

    private fun getIndexConfigurations(): List<IndexConfig> =
        catalogRepo.findAll().mapNotNull { getConfigFromDatabase(it) }

    private fun getConfigFromDatabase(catalog: Catalog): IndexConfig? =
        catalog.settings.indexCronPattern?.let { IndexConfig(catalog.identifier, "IGNORE", it) }

    override fun destroy() {
        executor.shutdownNow()
    }

    private fun initScheduler(): TaskScheduler {
        return ThreadPoolTaskScheduler().apply {
            poolSize = 10
            afterPropertiesSet()
        }
    }

    fun cancelIndexing(catalogId: String) {
        this.cancellations[catalogId] = true
    }

    fun removeFromIndex(catalogId: String, id: String, category: String) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val configs = getExporterConfigForCatalog(catalog)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val enumCategory = DocumentCategory.values().first { it.value == category }
        val categoryAlias = getIndexIdentifier(elasticsearchAlias, enumCategory)

        configs.forEach {
            try {
                val oldIndex =
                    it.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
                val info =
                    IndexInfo(
                        oldIndex!!,
                        if (category == "address") "address" else "base",
                        elasticsearchAlias,
                        null
                    )

                if (oldIndex != null && it.target.indexExists(oldIndex)) {
                    it.target.delete(info, id, true)
                }
            } catch (ex: Exception) {
                throw NoElasticsearchConnectionException.withReason(
                    ex.message ?: "No connection to Elasticsearch"
                )
            }
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
