package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.*
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.ReferenceHandlerFactory
import org.apache.logging.log4j.kotlin.logger
import org.quartz.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
@PersistJobDataAfterExecution
class URLChecker @Autowired constructor(
    val notifier: JobsNotifier,
    val referenceHandlerFactory: ReferenceHandlerFactory,
    val urlRequestService: UrlRequestService
) :
    InterruptableJob {

    companion object {
        val jobKey: JobKey = JobKey.jobKey("url-check", "system")
    }

    val log = logger()

    var currentThread: Thread? = null

    override fun execute(context: JobExecutionContext) {
        log.info("Starting Task: URLChecker")
        val message = UrlMessage()
        
        try {

            notifier.sendMessage(message.apply { this.message = "Started URLChecker" })

            val info = prepareJob(context, message)

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
        } catch (ex: Exception) {
            notifier.endMessage(message.apply { this.errors.add("Exception occurred: ${ex.message}") })
            throw ex
        }
    }

    private fun finishJob(
        message: UrlMessage,
        urls: List<UrlReport>,
        context: JobExecutionContext,
        errors: MutableList<String> = mutableListOf()
    ) {
        notifier.endMessage(message.apply {
            this.message = "Finished URLChecker"
            this.report = URLCheckerReport(urls.size, urls.filter { it.success.not() })
            this.errors = errors
        })

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["report"] = jacksonObjectMapper().writeValueAsString(message.report)
        persistData["errors"] = jacksonObjectMapper().writeValueAsString(message.errors)

        currentThread = null
    }

    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    private fun prepareJob(context: JobExecutionContext, message: UrlMessage): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")
        val referenceHandler = referenceHandlerFactory.get(profile)

        if (referenceHandler == null) {
            val msg = "No class defined to get URLs from catalog with profile $profile"
            log.warn(msg)
            finishJob(message, emptyList(), context, mutableListOf(msg))
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
        val status = urlRequestService.getStatus(info.url)
        info.status = status
        info.success = urlRequestService.isSuccessCode(status)
    }

    data class JobInfo(val profile: String, val catalogId: String, val referenceHandler: ReferenceHandler)
}
