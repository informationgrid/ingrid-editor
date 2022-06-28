package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.api.messaging.JobsNotifier
import org.apache.logging.log4j.kotlin.logger
import org.quartz.Job
import org.quartz.JobExecutionContext
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class URLChecker @Autowired constructor(val notifier: JobsNotifier) : Job {
    
    companion object {
        val jobKey: JobKey = JobKey.jobKey("urlChecker", "system")
    }
    
    val log = logger()

    override fun execute(context: JobExecutionContext?) {
        log.info("Starting Task: URLChecker")
        notifier.sendMessage("Started URLChecker")
        Thread.sleep(3000)
        log.debug("Task finished: URLChecker")
        notifier.sendMessage("Finished URLChecker")
    }
}