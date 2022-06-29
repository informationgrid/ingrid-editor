package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.UrlMessage
import org.apache.logging.log4j.kotlin.logger
import org.quartz.Job
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class URLChecker @Autowired constructor(val notifier: JobsNotifier) : Job {

    companion object {
        val jobKey: JobKey = JobKey.jobKey("url-check", "system")
    }

    val log = logger()


    override fun execute(context: JobExecutionContext?) {
        val dataMap: JobDataMap = context?.mergedJobDataMap!!

        val catalogId: String = dataMap.getString("catalogId")

        val message = UrlMessage()
        log.info("Starting Task: URLChecker for '$catalogId'")
        notifier.sendMessage(message.apply { this.message = "Started URLChecker" })
        Thread.sleep(3000)
        log.debug("Task finished: URLChecker for '$catalogId'")
        notifier.endMessage(message.apply { this.message = "Finished URLChecker" })
    }
}