package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.UrlMessage
import de.ingrid.igeserver.api.messaging.UrlReport
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
class URLChecker @Autowired constructor(val notifier: JobsNotifier, val uploadUtils: UploadUtils) : InterruptableJob {

    companion object {
        val jobKey: JobKey = JobKey.jobKey("url-check", "system")
    }

    val log = logger()

    var currentThread: Thread? = null

    val httpClient: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()

    override fun execute(context: JobExecutionContext?) {
        log.info("Starting Task: URLChecker")
        currentThread = Thread.currentThread()

        val message = UrlMessage()
        notifier.sendMessage(message.apply { this.message = "Started URLChecker" })

        val dataMap: JobDataMap = context?.mergedJobDataMap!!
        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!

        val catalogId: String = dataMap.getString("catalogId")

        val docs = uploadUtils.getURLsFromCatalog(catalogId)

        val urls = with(convertToUrlList(docs)) {
            forEachIndexed { index, urlReport ->
                notifier.sendMessage(message.apply { this.progress = calcProgress(index, size) })
                checkAndReportUrl(urlReport)
            }
            this
        }

        log.debug("Task finished: URLChecker for '$catalogId'")
        notifier.endMessage(message.apply {
            this.message = "Finished URLChecker"
            this.report = urls
        })

        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["report"] = message.report
    }

    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    private fun convertToUrlList(
        docs: List<UploadUtils.PublishedUploads>
    ): List<UrlReport> {
        val urls = mutableMapOf<String, UrlReport>()
        docs.forEach { doc ->
            doc.docs.forEach { docUrl ->
                val item: UrlReport
                val datasetInfo = DatasetInfo(doc.title, doc.type, doc.docUuid, docUrl.fromField)

                if (urls.containsKey(docUrl.uri)) {
                    item = urls[docUrl.uri]!!
                    item.datasets.add(datasetInfo)
                } else {
                    item = UrlReport(docUrl.uri, false, -1, mutableListOf(datasetInfo))
                    urls[docUrl.uri] = item
                }
            }
        }
        return urls.values.toList()
    }

    private fun calcProgress(current: Int, total: Int) = ((current / total.toDouble()) * 100).toInt()

    private fun checkAndReportUrl(info: UrlReport) {
        val status = httpHeadRequestSync(info.url)
        info.status = status

        when (status) {
            200 -> info.success = true
            else -> info.success = false
        }

    }

    fun httpHeadRequestSync(url: String): Int {
        val requestHead = HttpRequest.newBuilder()
            .method("HEAD", HttpRequest.BodyPublishers.noBody())
            .uri(URI.create(url))
            .build()
        return try {
            val httpResponse = httpClient.send(requestHead, HttpResponse.BodyHandlers.discarding())
            println("httpResponse statusCode = ${httpResponse.statusCode()}")
            println(httpResponse.headers().toString())
            httpResponse.statusCode()
        } catch (ex: Exception) {
            log.warn("Error requesting URL '$url': ${ex.message}")
            500
        }
    }
}