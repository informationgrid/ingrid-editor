package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.SchedulingConfigurer
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.scheduling.config.ScheduledTaskRegistrar
import org.springframework.scheduling.support.CronTrigger
import org.springframework.stereotype.Component
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture


@Component
class IndexingTask @Autowired constructor(
        private val indexService: IndexService,
        private val esIndexManager: IndexManager,
        private val dbService: DBApi) : SchedulingConfigurer, DisposableBean {

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
    fun startIndexing(database: String, format: String) {
        log.debug("Starting Indexing - Task for $database")

        dbService.acquire(database).use {

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
            indexService.start(indexService.INDEX_PUBLISHED_DOCUMENTS(format))
                    .forEach { indexManager.update(indexInfo, convertToElasticDocument(it), false) }


            // post phase
            indexPostPhase(elasticsearchAlias, info.first, info.second)

        }

        log.debug("Indexing finished")
    }

    /**
     * Indexing of a single document into an Elasticsearch index.
     */
    // TODO: implement
    fun updateDocument(database: String, format: String, docId: String) {

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

        // get index configurations from all catalogs
        getIndexConfigurations()
                .filter { !it.cron.isEmpty() }
                .forEach { config ->
                    val future = addSchedule(config)
                    config.future = future
                    scheduledFutures.add(config)
                }

    }

    private fun addSchedule(config: IndexConfig): ScheduledFuture<*>? {
        val trigger = CronTrigger(config.cron)
        return scheduler.schedule(Runnable { startIndexing(config.database, "portal") }, trigger)
    }

    fun updateTaskTrigger(database: String, cronPattern: String) {

        val schedule = scheduledFutures.find { it.database == database }
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

        return dbService.databases
                .map { getConfigFromDatabase(it) }
                .filterNotNull()

    }

    private fun getConfigFromDatabase(database: String): IndexConfig? {

        return dbService.acquire(database).use {
            val cron = indexService.getConfig()
            if (cron == null) {
                null
            } else {
                IndexConfig(database, cron)
            }
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

data class IndexConfig(val database: String, val cron: String, var future: ScheduledFuture<*>? = null, val onStartup: Boolean = false)
