package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.UrlMessage
import de.ingrid.igeserver.profiles.uvp.UploadUtils
import org.apache.logging.log4j.kotlin.logger
import org.quartz.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

@Component
@PersistJobDataAfterExecution
class URLChecker @Autowired constructor(val notifier: JobsNotifier, val uploadUtils: UploadUtils) : Job {

    companion object {
        val jobKey: JobKey = JobKey.jobKey("url-check", "system")
    }

    val log = logger()

    val httpClient: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()

    override fun execute(context: JobExecutionContext?) {
        log.info("Starting Task: URLChecker")

        val dataMap: JobDataMap = context?.mergedJobDataMap!!
        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!

        val catalogId: String = dataMap.getString("catalogId")

        val docs = uploadUtils.getURLsFromCatalog(catalogId)

        val message = UrlMessage()
        notifier.sendMessage(message.apply { this.message = "Started URLChecker" })
        val size = docs.size

        val result = docs.flatMapIndexed { index: Int, doc: UploadUtils.PublishedUploads ->
            notifier.sendMessage(message.apply { this.progress = calcProgress(index, size) })
//            Thread.sleep(1500)
            doc.docs.map { checkAndReportUrl(it) }
        }

        /*log.info("Starting Task: URLChecker for '$catalogId'")
        notifier.sendMessage(message.apply { this.message = "Started URLChecker" })
        Thread.sleep(1000)
        notifier.sendMessage(message.apply { this.progress = 10 })
        Thread.sleep(1000)
        notifier.sendMessage(message.apply { this.progress = 40 })
        Thread.sleep(1000)
        notifier.sendMessage(message.apply { this.progress = 50 })
        Thread.sleep(1000)
        notifier.sendMessage(message.apply { this.progress = 80 })*/

        log.debug("Task finished: URLChecker for '$catalogId'")
        notifier.endMessage(message.apply { this.message = "Finished URLChecker" })
        persistData.put("start", message.startTime)
        persistData.put("end", message.endTime)
    }

    private fun calcProgress(current: Int, total: Int) = ((current / total.toDouble()) * 100).toInt()

    private fun checkAndReportUrl(info: UploadUtils.UploadInfo): UrlReport {
        httpHeadRequestSync(info.uri)
        return createSuccessReport(info)
    }

    private fun createSuccessReport(info: UploadUtils.UploadInfo): UrlReport {
        return UrlReport(true, info)
    }

    fun httpHeadRequestSync(url: String): Int {
        val requestHead = HttpRequest.newBuilder()
            .method("HEAD", HttpRequest.BodyPublishers.noBody())
            .uri(URI.create(url))
            .build()
        try {
            val httpResponse = httpClient.send(requestHead, HttpResponse.BodyHandlers.discarding())
            println("httpResponse statusCode = ${httpResponse.statusCode()}")
            println(httpResponse.headers().toString())
            return httpResponse.statusCode()
        } catch (ex: Exception) {
            log.warn("Error requesting URL '$url': ${ex.message}")
            return 500
        }
    }
}

data class UrlReport(val success: Boolean, val info: UploadUtils.UploadInfo)