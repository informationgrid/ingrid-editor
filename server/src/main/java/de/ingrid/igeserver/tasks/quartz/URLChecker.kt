package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.*
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.ReferenceHandlerFactory
import org.apache.logging.log4j.LogManager
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*

@Component
@PersistJobDataAfterExecution
class URLChecker @Autowired constructor(
    val notifier: JobsNotifier,
    val referenceHandlerFactory: ReferenceHandlerFactory,
    val urlRequestService: UrlRequestService
) : IgeJob() {

    companion object {
        private val log = LogManager.getLogger()
        const val jobKey: String = "url-check"
    }


    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: URLChecker")
        val message = Message()
        val info = prepareJob(context)
        val notificationType = MessageTarget(NotificationType.URL_CHECK, info.catalogId)

        try {
            if (info.referenceHandler == null) {
                val msg = "No class defined to get URLs from catalog with profile ${info.profile}"
                log.warn(msg)
                message.apply {
                    this.message = "Finished URLChecker"
                    this.report = URLCheckerReport(0, emptyList())
                    this.endTime = Date()
                    this.errors = mutableListOf(msg)
                }.also {
                    finishJob(context, it)
                    notifier.sendMessage(notificationType, it)

                }
                throw ClientException.withReason(msg)
            }

            notifier.sendMessage(notificationType, message.apply { this.message = "Started URLChecker" })

            val docs = info.referenceHandler.getURLsFromCatalog(info.catalogId)

            val urls = with(convertToUrlList(docs)) {
                forEachIndexed { index, urlReport ->
                    notifier.sendMessage(notificationType, message.apply { this.progress = calcProgress(index, size) })
                    checkAndReportUrl(urlReport)
                }
                this
            }

            val invalidUrlReport = URLCheckerReport(urls.size, urls.filter { it.success.not() })
            message.apply {
                this.message = "Finished URLChecker"
                this.report = invalidUrlReport
                this.endTime = Date()
            }.also {
                finishJob(context, it)
                notifier.sendMessage(notificationType, it)

            }
            log.debug("Task finished: URLChecker for '${info.catalogId}'")
        } catch (ex: Exception) {
            notifier.endMessage(notificationType, message.apply { this.errors.add("Exception occurred: ${ex.message}") })
            throw ex
        }
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")
        val referenceHandler = referenceHandlerFactory.get(profile)

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

    private data class JobInfo(val profile: String, val catalogId: String, val referenceHandler: ReferenceHandler?)
}
