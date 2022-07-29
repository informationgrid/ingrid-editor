package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.elasticsearch.IBusIndexManager
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.SettingsService
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.elasticsearch.common.Strings
import org.elasticsearch.common.xcontent.XContentBuilder
import org.elasticsearch.common.xcontent.XContentFactory
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.annotation.Autowired
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
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import javax.annotation.PostConstruct
import kotlin.concurrent.schedule


@Component
@Profile("elasticsearch")
class IndexingTask @Autowired constructor(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val directIndexManager: IndexManager,
    private val iBusIndexManager: IBusIndexManager,
    private val catalogRepo: CatalogRepository,
    @Value("\${elastic.communication.ibus:true}")
    private val indexThroughIBus: Boolean,
    private val appProperties: GeneralProperties,
    private val codelistService: CodeListService
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()

    @Autowired
    lateinit var generalProperties: GeneralProperties

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

        categories.forEach categoryLoop@{ category ->
            val categoryAlias = "${elasticsearchAlias}_${category.value}"

            val exporter = try {
                indexService.getExporter(category, format)
            } catch (ex: ConfigurationException) {
                log.debug("No exporter defined for '${format}' and category '${category.value}'")
                // add plugdescription for correct usage in iBus, since data and address index have the same
                // plugId, both need the plugdescription info
                val plugInfo = IPlugInfo(elasticsearchAlias, null, "none", category.value, partner, provider, catalogId)
                updateIBusInformation(plugInfo)
                return@categoryLoop
            }

            // pre phase
            val info = try {
                indexPrePhase(categoryAlias, catalog.type, format, elasticsearchAlias)
            } catch (ex: Exception) {
                notify.addAndSendMessageError(message, ex, "Error during Index Pre-Phase: ")
                return@categoryLoop // throw ServerException.withReason("Error in Index Pre-Phase + ${ex.message}")
            }

            // TODO: configure index name
            val indexInfo = IndexInfo().apply {
                realIndexName = info.second
                toType = "base"
                toAlias = categoryAlias
                docIdField = "t01_object.obj_id"
            }

            var page = -1
            try {
                do {
                    page++
                    // TODO: support profile specific configuration which documents to be published
                    val docsToPublish = indexService.getPublishedDocuments(catalogId, category.value, format, page)
                    // isLast function sometimes delivers the next to last page without a total count, so we write our own
                    val isLast = (page*10 + docsToPublish.numberOfElements).toLong() == docsToPublish.totalElements
                    updateMessageWithDocumentInfo(message, category, docsToPublish)

                    exportDocuments(docsToPublish, catalogId, message, category, page, exporter, indexInfo)
                } while (!isLast)
            } catch (ex: Exception) {
                notify.addAndSendMessageError(message, ex, "Error during indexing: ")
            }

            notify.sendMessage(message.apply { this.message = "Post Phase" })

            // post phase
            val plugInfo = IPlugInfo(elasticsearchAlias, info.first, info.second, category.value, partner, provider, catalogId)
            indexPostPhase(plugInfo)
            log.debug("Task finished: Indexing for $catalogId")
        }

        // make sure to write everything to elasticsearch
        // if another indexing starts right afterwards, then the previous index could still be there
        indexManager.flush()

        log.debug("Indexing finished")
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
        docsToPublish: Page<Document>
    ) {
        if (category == DocumentCategory.DATA) {
            message.numDocuments = docsToPublish.totalElements.toInt()
        } else {
            message.numAddresses = docsToPublish.totalElements.toInt()
        }
    }

    private fun exportDocuments(
        docsToPublish: Page<Document>,
        catalogId: String,
        message: IndexMessage,
        category: DocumentCategory,
        page: Int,
        exporter: IgeExporter,
        indexInfo: IndexInfo
    ) {
        docsToPublish.content
            .mapIndexedNotNull { index, doc ->
                handleCancelation(catalogId, message)
                sendNotification(category, message, index + (page * 10))
                log.debug("export ${doc.uuid}")
                try {
                    exporter.run(doc, catalogId)
                } catch (ex: Exception) {
                    val errorMessage = "Error exporting document ${doc.uuid}: ${ex.message}"
                    log.error(errorMessage, ex)
                    message.errors.add(errorMessage)
                    sendNotification(category, message, index + (page * 10))
                    null
                }
            }
            .onEach {
                indexManager.update(indexInfo, convertToElasticDocument(it), false)
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
            notify.sendMessage(message.apply { this.progressDocuments = index + 1 })
        } else {
            notify.sendMessage(message.apply { this.progressAddresses = index + 1 })
        }
    }

    /**
     * Indexing of a single document into an Elasticsearch index.
     */
    fun updateDocument(catalogId: String, category: DocumentCategory, format: String, docId: String) {

        runAsCatalogAdministrator()

        val exporter = indexService.getExporter(category, format)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)

        try {
            val doc = indexService.getSinglePublishedDocument(catalogId, DocumentCategory.DATA, format, docId)

            val export = exporter.run(doc, catalogId)

            log.debug("Exported document: $export")
            val indexInfo = getOrPrepareIndex(catalog.type, category, format, elasticsearchAlias)
            indexManager.update(indexInfo, convertToElasticDocument(export), false)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingPublishedVersion(docId, ex)
        }
    }

    private fun getOrPrepareIndex(
        catalogType: String,
        category: DocumentCategory,
        format: String,
        elasticsearchAlias: String
    ): IndexInfo {
        var oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, generalProperties.uuid)
        if (oldIndex == null) {
            val categoryAlias = "${elasticsearchAlias}_${category.value}"
            val (_, newIndex) = indexPrePhase(categoryAlias, catalogType, format, elasticsearchAlias)
            oldIndex = newIndex
            // TODO: indexManager.addToAlias(elasticsearchAlias, newIndex)
        }

        return IndexInfo().apply {
            realIndexName = oldIndex
            toType = "base"
            toAlias = elasticsearchAlias
            docIdField = "t01_object.obj_id" // TODO: make docIdField dynamic
        }
    }

    private fun convertToElasticDocument(doc: Any): ElasticDocument? {

        return jacksonObjectMapper()
//            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature())
            .readValue(doc as String, ElasticDocument::class.java)

    }


    private fun indexPrePhase(
        alias: String,
        catalogType: String,
        format: String,
        elasticsearchAlias: String
    ): Pair<String, String> {
        val catalogProfile = catalogService.getCatalogProfile(catalogType)

        val oldIndex = indexManager.getIndexNameFromAliasName(alias, generalProperties.uuid)
        val newIndex = IndexManager.getNextIndexName(alias, generalProperties.uuid, elasticsearchAlias)
        indexManager.createIndex(
            newIndex,
            "base",
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
        if (indexThroughIBus) {
            val plugIdInfo = "ige-ng:${info.alias}:${info.category}"
            indexManager.updateIPlugInformation(
                plugIdInfo,
                getIPlugInfo(plugIdInfo, info.newIndex, false, null, null, info.partner, info.provider, info.catalogId)
            )
        }
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
        catalogId: String?
    ): String? {

        val plugId = "ige-ng_$catalogId"
        val xContentBuilder: XContentBuilder = XContentFactory.jsonBuilder().startObject()
            .field("plugId", plugId)
            .field("indexId", infoId)
            .field("iPlugName", prepareIPlugName(infoId))
            .field("linkedIndex", indexName)
            .field("linkedType", "base")
            .field("adminUrl", appProperties.host)
            .field("lastHeartbeat", Date())
            .field("lastIndexed", Date())
            .field("plugdescription", settingsService.getPlugDescription(partner, provider, plugId))
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

    fun removeFromIndex(catalogId: String, id: String) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        try {
            val oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, generalProperties.uuid)
            val info = IndexInfo().apply {
                realIndexName = oldIndex
                toType = "base"
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
    val catalogId: String
)
