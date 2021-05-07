package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.repository.CatalogRepository
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
import org.springframework.stereotype.Component
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import kotlin.concurrent.schedule


@Component
@Profile("elasticsearch")
class IndexingTask @Autowired constructor(
    private val indexService: IndexService,
    private val notify: IndexingNotifier,
    private val esIndexManager: IndexManager,
    private val catalogRepo: CatalogRepository,
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val indexManager: IIndexManager = getIndexManager()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()

    @Value("\${elastic.alias}")
    private lateinit var elasticsearchAlias: String

    @Value("\${app.uuid}")
    private lateinit var uuid: String


    private fun getIndexManager(): IIndexManager {
        return esIndexManager
    }

    /**
     * Indexing of all published documents into an Elasticsearch index.
     */
    fun startIndexing(catalogId: String, format: String) {
        log.debug("Starting Indexing - Task for $catalogId")
        
        val message = IndexMessage()
        notify.sendMessage(message.apply { this.message = "Start Indexing for catalog: $catalogId" })

        // needed information:
        //   database/catalog
        //   indexingMethod: ibus or elasticsearch direct
        //   indexName

        // pre phase
        val info = indexPrePhase(elasticsearchAlias)

        // iterate over all documents
        // TODO: dynamically get target to send exported documents

        // TODO: configure index name
        val indexInfo = IndexInfo()
        indexInfo.realIndexName = info.second
        indexInfo.toType = "base"
        indexInfo.toAlias = elasticsearchAlias
        indexInfo.docIdField = "uuid"

        // TODO: support profile specific configuration which documents to be published
        val exporter = indexService.getExporter(format)
        
        // TODO: use paging to get all documents
        val docsToPublish = indexService.getPublishedDocuments(catalogId, format)
        message.numDocuments = docsToPublish.totalElements.toInt()
        
        docsToPublish.content
            .onEachIndexed { index, _ -> 
                log.info("start $index")
                notify.sendMessage(message.apply { this.progressDocuments = index + 1 }) }
            .map {
                log.info("export")
                exporter.run(it)
            }
            .onEach {
                log.info("write to Elasticsearch")
                indexManager.update(indexInfo, convertToElasticDocument(it), false)
            }

        notify.sendMessage(message.apply { this.message = "Post Phase" })

        // post phase
        indexPostPhase(elasticsearchAlias, info.first, info.second)

        log.debug("Indexing finished")
        notify.sendMessage(message.apply { 
            this.endTime = Date()
            this.message = "Indexing finished"
        })
        
        // save last indexing information to database for this catalog to get this in frontend
        val catalog = catalogRepo.findByIdentifier(catalogId)
        if (catalog.settings == null) {
            catalog.settings = CatalogSettings(lastLogSummary = message)
        } else {
            catalog.settings?.lastLogSummary = message
        }
        catalogRepo.save(catalog)
    }

    /**
     * Indexing of a single document into an Elasticsearch index.
     */
    // TODO: implement
    fun updateDocument(catalog: String, format: String, docId: String) {

    }

    private fun convertToElasticDocument(doc: Any): ElasticDocument? {

        return jacksonObjectMapper()
            .enable(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS)
            .readValue(doc as String, ElasticDocument::class.java)

    }


    private fun indexPrePhase(alias: String): Pair<String, String> {
        val oldIndex = indexManager.getIndexNameFromAliasName(alias, uuid)
        val newIndex = IndexManager.getNextIndexName(alias, uuid, "ige-ng-test")
        indexManager.createIndex(newIndex, "base", indexManager.defaultMapping, indexManager.defaultSettings)
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
                .filter { !it.cron.isEmpty() }
                .forEach { config ->
                    val future = addSchedule(config)
                    config.future = future
                    scheduledFutures.add(config)
                }
        }

    }

    private fun addSchedule(config: IndexConfig): ScheduledFuture<*>? {
        val trigger = CronTrigger(config.cron)
        return scheduler.schedule(Runnable { startIndexing(config.catalogId, "portal") }, trigger)
    }

    fun updateTaskTrigger(database: String, cronPattern: String) {

        val schedule = scheduledFutures.find { it.catalogId == database }
        schedule?.future?.cancel(false)
        scheduledFutures.remove(schedule)
        if (cronPattern.isEmpty()) {
            log.info("Indexing Task for '$database' disabled")
        } else {
            val config = IndexConfig(database, cronPattern)
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
            IndexConfig(catalog.identifier, cron)
        }

    }

    override fun destroy() {
        executor.shutdownNow()
    }

    final fun initScheduler(): TaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 10
        scheduler.afterPropertiesSet()
        return scheduler
    }
}

data class IndexConfig(
    val catalogId: String,
    val cron: String,
    var future: ScheduledFuture<*>? = null,
    val onStartup: Boolean = false
)
