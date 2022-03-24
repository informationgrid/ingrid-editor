package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
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
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import kotlin.NoSuchElementException
import kotlin.concurrent.schedule


@Component
@Profile("elasticsearch")
class IndexingTask @Autowired constructor(
    private val indexService: IndexService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val indexManager: IndexManager,
    private val catalogRepo: CatalogRepository,
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()

    @Value("\${elastic.alias}")
    private lateinit var elasticsearchAlias: String

    @Autowired
    lateinit var generalProperties: GeneralProperties


    fun indexByScheduler(catalogId: String, format: String) {
        Timer("ManualIndexing", false).schedule(0) {
            val auth: Authentication =
                UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
            SecurityContextHolder.getContext().authentication = auth
            startIndexing(catalogId, format)
        }
    }

    /**
     * Indexing of all published documents into an Elasticsearch index.
     */
    fun startIndexing(catalogId: String, format: String) {
        log.debug("Starting Indexing - Task for $catalogId")

        val message = IndexMessage()
        notify.sendMessage(message.apply { this.message = "Start Indexing for catalog: $catalogId" })
        val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)

        categories.forEach categoryLoop@{ category ->
            // needed information:
            //   database/catalog
            //   indexingMethod: ibus or elasticsearch direct
            //   indexName
            // TODO: get alias from profile
            val categoryAlias = "${elasticsearchAlias}_${category.value}"

            // TODO: support profile specific configuration which documents to be published
            val exporter = try {
                indexService.getExporter(category, format)
            } catch (ex: ConfigurationException) {
                log.warn("No exporter defined for '${format}' and category '${category.value}'")
                return@categoryLoop
            }

            // pre phase
            val info = try {
                indexPrePhase(categoryAlias, catalogId, format)
            } catch (ex: Exception) {
                val errorMessage = "Error during Index Pre-Phase: ${ex.message}"
                log.error(errorMessage, ex)
                notify.sendMessage(message.apply {
                    errors.add(errorMessage)
                })
                return@categoryLoop // throw ServerException.withReason("Error in Index Pre-Phase + ${ex.message}")
            }

            // TODO: dynamically get target to send exported documents

            // TODO: configure index name
            val indexInfo = IndexInfo().apply {
                realIndexName = info.second
                toType = "base"
                toAlias = categoryAlias
                docIdField = "uuid"
            }

            var page = -1
            do {
                page++
                val docsToPublish = indexService.getPublishedDocuments(catalogId, category.value, format, page)
                if (category == DocumentCategory.DATA) {
                    message.numDocuments = docsToPublish.totalElements.toInt()
                } else {
                    message.numAddresses = docsToPublish.totalElements.toInt()
                }

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
            } while (!docsToPublish.isLast)

            notify.sendMessage(message.apply { this.message = "Post Phase" })

            // post phase
            indexPostPhase(elasticsearchAlias, info.first, info.second)

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

        val exporter = indexService.getExporter(category, format)

        try {
            val doc = indexService.getSinglePublishedDocument(catalogId, DocumentCategory.DATA, format, docId)

            val export = exporter.run(doc, catalogId)

            log.debug("Exported document: $export")
            val indexInfo = getOrPrepareIndex(catalogId, category, format)
            indexManager.update(indexInfo, convertToElasticDocument(export), false)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingPublishedVersion(docId, ex)
        }
    }

    private fun getOrPrepareIndex(catalogId: String, category: DocumentCategory, format: String): IndexInfo {
        var oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, generalProperties.uuid)
        if (oldIndex == null) {
            val categoryAlias = "${elasticsearchAlias}_${category.value}"
            val (_, newIndex) = indexPrePhase(categoryAlias, catalogId, format)
            oldIndex = newIndex
            indexManager.addToAlias(elasticsearchAlias, newIndex)
        }

        return IndexInfo().apply {
            realIndexName = oldIndex
            toType = "base"
            toAlias = elasticsearchAlias
            docIdField = "uuid"
        }
    }

    private fun convertToElasticDocument(doc: Any): ElasticDocument? {

        return jacksonObjectMapper()
//            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature())
            .readValue(doc as String, ElasticDocument::class.java)

    }


    private fun indexPrePhase(alias: String, catalogId: String, format: String): Pair<String, String> {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)

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

    private fun indexPostPhase(alias: String, oldIndex: String, newIndex: String) {
        // switch alias and delete old index
        indexManager.switchAlias(alias, oldIndex, newIndex)
        removeOldIndices(newIndex)
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
            val auth: Authentication =
                UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
            SecurityContextHolder.getContext().authentication = auth

            startIndexing(config.catalogId, "portal")
        }, trigger)
    }

    fun updateTaskTrigger(database: String, exportFormat: String, cronPattern: String) {

        val schedule = scheduledFutures.find { it.catalogId == database }
        schedule?.future?.cancel(false)
        scheduledFutures.remove(schedule)
        if (cronPattern.isEmpty()) {
            log.info("Indexing Task for '$database' disabled")
        } else {
            val config = IndexConfig(database, exportFormat, cronPattern)
            val newFuture = addSchedule(config)
            config.future = newFuture
            scheduledFutures.add(config)
            log.info("Indexing Task for '$database' rescheduled")
        }

    }

    private fun getIndexConfigurations(): List<IndexConfig> {

        return catalogRepo.findAll().mapNotNull { getConfigFromDatabase(it) }

    }

    private fun getConfigFromDatabase(catalog: Catalog): IndexConfig? {

        val cron = catalog.settings?.indexCronPattern
        return if (cron == null) {
            null
        } else {
            IndexConfig(catalog.identifier, "portal", cron)
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
}

data class IndexConfig(
    val catalogId: String,
    val exportFormat: String,
    val cron: String,
    var future: ScheduledFuture<*>? = null,
    val onStartup: Boolean = false
)
