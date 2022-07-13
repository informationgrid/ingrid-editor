package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.UrlMessage
import de.ingrid.igeserver.api.messaging.UrlReport
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.ReferenceHandlerFactory
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
class URLChecker @Autowired constructor(val notifier: JobsNotifier, val referenceHandlerFactory: ReferenceHandlerFactory) :
    InterruptableJob {

    companion object {
        val jobKey: JobKey = JobKey.jobKey("url-check", "system")
    }

    val log = logger()

    var currentThread: Thread? = null

    val httpClient: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()


    override fun execute(context: JobExecutionContext) {
        log.info("Starting Task: URLChecker")

        val message = UrlMessage()
        notifier.sendMessage(message.apply { this.message = "Started URLChecker" })

        val info = prepareJob(context)

        val docs = info.referenceHandler.getURLsFromCatalog(info.catalogId)

        val urls = with(convertToUrlList(docs)) {
            forEachIndexed { index, urlReport ->
                notifier.sendMessage(message.apply { this.progress = calcProgress(index, size) })
                checkAndReportUrl(urlReport)
            }
            this
        }

        finishJob(message, urls, context)
        log.debug("Task finished: URLChecker for '$info.catalogId'")
    }

    private fun finishJob(
        message: UrlMessage,
        urls: List<UrlReport>,
        context: JobExecutionContext
    ) {
        notifier.endMessage(message.apply {
            this.message = "Finished URLChecker"
            this.report = urls
        })

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["report"] = message.report

        currentThread = null
    }

    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")
        val referenceHandler = referenceHandlerFactory.get(profile)

        if (referenceHandler == null) {
            val msg = "No class defined to get URLs from catalog with profile $profile"
            log.warn(msg)
            throw ClientException.withReason(msg)
        }
        currentThread = Thread.currentThread()

        return JobInfo(profile, catalogId, referenceHandler)
    }

    private fun convertToUrlList(
        docs: List<DocumentLinks>
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

    data class JobInfo (val profile: String, val catalogId: String, val referenceHandler: ReferenceHandler)
}