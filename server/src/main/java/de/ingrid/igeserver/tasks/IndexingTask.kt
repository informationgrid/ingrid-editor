package de.ingrid.igeserver.tasks

import de.ingrid.elasticsearch.ElasticConfig
import de.ingrid.elasticsearch.IBusIndexManager
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.DBApi
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.DisposableBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.SchedulingConfigurer
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.scheduling.config.ScheduledTaskRegistrar
import org.springframework.scheduling.support.CronTrigger
import org.springframework.stereotype.Component
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture


@Component
class IndexingTask @Autowired constructor(private val indexService: IndexService, private val dbService: DBApi) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val indexManager: IIndexManager = getIndexManager()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()


    private fun getIndexManager(): IIndexManager {
        val config = ElasticConfig()
        config.uuid = "123456789"
        return IBusIndexManager(config)
    }

    fun startIndexing(database: String) {
        log.debug("Starting Indexing - Task for $database")

        // needed information:
        //   database/catalog
        //   indexingMethod: ibus or elasticsearch direct
        //   indexName

        // pre phase
        // indexManager.createIndex("ige-ng-test")

        // iterate over all documents
//        indexService.start()

        // post phase
        // switch alias and delete old index

    }

    // check out here: https://stackoverflow.com/questions/39152599/interrupt-spring-scheduler-task-before-next-invocation
    override fun configureTasks(taskRegistrar: ScheduledTaskRegistrar) {

        // get index configurations from all catalogs
        getIndexConfigurations()
                .forEach { config ->
                    val future = addSchedule(config)
                    config.future = future
                    scheduledFutures.add(config)
                }

    }

    private fun addSchedule(config: IndexConfig): ScheduledFuture<*>? {
        val trigger = CronTrigger(config.cron)
        return scheduler.schedule(Runnable { startIndexing(config.database) }, trigger)
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

    fun initScheduler(): TaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 10
        scheduler.afterPropertiesSet()
        return scheduler
    }
}

data class IndexConfig(val database: String, val cron: String, var future: ScheduledFuture<*>? = null, val onStartup: Boolean = false)