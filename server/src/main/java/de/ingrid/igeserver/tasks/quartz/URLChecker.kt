/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.api.messaging.URLCheckerReport
import de.ingrid.igeserver.api.messaging.UrlReport
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.ReferenceHandlerFactory
import de.ingrid.utils.tool.UrlTool
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import java.net.HttpURLConnection
import java.net.URL
import java.util.*

@Component
@PersistJobDataAfterExecution
class URLChecker(
    val notifier: JobsNotifier,
    val referenceHandlerFactory: ReferenceHandlerFactory,
    val urlRequestService: UrlRequestService,
    val catalogService: CatalogService,
) : IgeJob() {

    companion object {
        const val JOB_KEY: String = "url-check"
    }

    override val log = logger()

    @OptIn(ExperimentalCoroutinesApi::class)
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

            val docs = info.referenceHandler.getURLsFromCatalog(info.catalogId, info.groupDocIds, info.profile)

            val urls = convertToUrlList(docs)
            val semaphore = Semaphore(10)

            runBlocking {
                urls.forEachIndexed { index, urlReport ->
                    launch {
                        semaphore.withPermit {
                            notifier.sendMessage(
                                notificationType,
                                message.apply { this.progress = calcProgress(index, urls.size) },
                            )
                            checkAndReportUrl(urlReport)
                        }
                    }
                }
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
            notifier.endMessage(
                notificationType,
                message.apply { this.errors.add("Exception occurred: ${ex.message}") },
            )
            throw ex
        }
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val catalogId: String = dataMap.getString("catalogId")
        val docIdsAsString = dataMap.getString("groupDocIds")
        val groupDocIds: List<Int> =
            if (docIdsAsString.isEmpty()) emptyList() else docIdsAsString.split(",").map { it.toInt() }

        val profile = catalogService.getProfileFromCatalog(catalogId)
        val referenceHandler = referenceHandlerFactory.get(profile)

        return JobInfo(profile.identifier, catalogId, referenceHandler, groupDocIds)
    }

    private fun convertToUrlList(
        docs: List<DocumentLinks>,
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

    private suspend fun checkAndReportUrl(info: UrlReport) = try {
        (
            withContext(Dispatchers.IO) {
                // encode URL to handle those with special characters like umlauts
                // alternatively we might use: url.toURI().toASCIIString()
                URL(UrlTool.getEncodedUnicodeUrl(info.url)).openConnection()
            } as HttpURLConnection
            ).let {
            it.connectTimeout = 3000
            it.readTimeout = 1500
            it.instanceFollowRedirects = true
            it.connect()
            info.status = it.responseCode
            info.success = urlRequestService.isSuccessCode(info.status)
        }
    } catch (ex: Exception) {
        log.warn("Error requesting URL '${info.url}': $ex")
        info.status = 500
        info.success = false
    }

    private data class JobInfo(
        val profile: String,
        val catalogId: String,
        val referenceHandler: ReferenceHandler?,
        val groupDocIds: List<Int>,
    )
}
