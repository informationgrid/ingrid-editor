package de.ingrid.igeserver.tasks

import de.ingrid.elasticsearch.ElasticConfig
import de.ingrid.elasticsearch.IBusIndexManager
import de.ingrid.igeserver.services.IBusService
import de.ingrid.utils.IngridCall
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct

@Component
class IndexingTask @Autowired constructor(private val iBusService: IBusService) {

    val log = logger()
    private val indexManager: IBusIndexManager = getIndexManager()

    private fun getIndexManager(): IBusIndexManager {
        val config = ElasticConfig()
        config.uuid = "123456789"
        return IBusIndexManager(config)
    }


    @PostConstruct
    fun onStartup() {
        startIndexing()
    }

    //    @Scheduled(cron = "\${cron.codelist.expression}")
    fun startIndexing() {
        log.debug("Starting Indexing - Task")
        // indexManager.createIndex("ige-ng-test")

    }
}