/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveMessage
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveNotifier
import de.ingrid.igeserver.profiles.uvp.messaging.ArchivedDatasetInfo
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.runAsAdmin
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.util.*

@Component
@PersistJobDataAfterExecution
class UvpAutomaticArchiveTask(
    private val transactionManager: PlatformTransactionManager,
    private val uvpArchiveService: UvpArchiveService,
    private val documentService: DocumentService,
    private val behaviourService: BehaviourService,
    private val notify: ArchiveNotifier,
) : IgeJob() {
    override val log = logger()
    private val berlinZone = ZoneId.of("Europe/Berlin")

    companion object {
        const val JOB_KEY = "uvp-automatic-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Archive")
        val catalogId = context.mergedJobDataMap?.getString("catalogId")
            ?: context.jobDetail?.key?.group?.takeIf { it != "DEFAULT" && it.isNotBlank() }!!

        val dateString = context.mergedJobDataMap?.getString("date")
        val isManualMode = dateString != null

        val archiveDate = if (isManualMode) {
            OffsetDateTime.parse(dateString)
        } else {
            val config = behaviourService.getData(catalogId, "plugin.uvp.archive")
                ?: return
            val automaticArchiveEnabled = config["automaticArchiveEnabled"] as? Boolean ?: false
            val months = (config["archiveAfterMonths"] as? Number)?.toLong() ?: 2
            if (!automaticArchiveEnabled || months < 1) return
            val today = LocalDate.now(berlinZone).atStartOfDay(berlinZone).toOffsetDateTime()
            today.minusMonths(months)
        }

        val archiveAfterMonths = if (isManualMode) {
            null
        } else {
            val config = behaviourService.getData(catalogId, "plugin.uvp.archive")
                ?: return
            (config["archiveAfterMonths"] as? Number)?.toInt()
        }

        archiveCatalog(context, catalogId, archiveDate, archiveAfterMonths, isManualMode)
        log.info("Task finished: UVP-Archive")
    }

    private fun archiveCatalog(context: JobExecutionContext, catalogId: String, date: OffsetDateTime, archiveAfterMonths: Int?, isManualMode: Boolean = false) {
        val startTime = Date()
        val message = ArchiveMessage(catalogId, automatic = !isManualMode)
        notify.sendMessage(
            message.apply {
                this.message = if (isManualMode) "Start archiving for catalog: $catalogId" else "Start automatic archiving for catalog: $catalogId"
            },
        )

        val datasets = try {
            uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)
        } catch (exception: Exception) {
            message.errors.add("Could not find datasets: ${exception.message}")
            message.endTime = Date()
            finishJob(context, message)
            notify.sendMessage(message)
            storeExecutionHistory(context, startTime, Date(), 0, message.errors, null, archiveAfterMonths)
            return
        }

        val archivedDatasets = mutableListOf<ArchivedDatasetInfo>()
        message.report = archivedDatasets
        runAsAdmin("UVPAutoArchive", "Task") { principal ->
            datasets.forEach { dataset ->
                try {
                    val docData = ClosableTransaction(transactionManager).use {
                        documentService.archiveDocument(principal, catalogId, dataset.wrapperId)
                    }
                    message.progress++
                    archivedDatasets.add(
                        ArchivedDatasetInfo(
                            id = dataset.wrapperId,
                            docId = docData.document.id,
                            uuid = docData.document.uuid,
                            title = docData.document.title,
                            type = docData.document.type,
                        ),
                    )
                    notify.sendMessage(message)
                } catch (exception: Exception) {
                    message.errors.add("Could not archive dataset ${dataset.wrapperId}: ${exception.message}")
                    log.error("Could not archive dataset ${dataset.wrapperId} in catalog $catalogId", exception)
                    notify.sendMessage(message)
                }
            }
        }

        val endTime = Date()
        message.endTime = endTime
        finishJob(context, message)
        notify.sendMessage(message)

        storeExecutionHistory(context, startTime, endTime, message.progress, message.errors, message.report, archiveAfterMonths, isManualMode)
    }

    private fun storeExecutionHistory(
        context: JobExecutionContext,
        startTime: Date,
        endTime: Date,
        archivedCount: Int,
        errors: MutableList<String>,
        report: Any?,
        archiveAfterMonths: Int?,
        isManualMode: Boolean = false,
    ) {
        val jobDataMap = context.jobDetail?.jobDataMap ?: return
        val mapper = jacksonObjectMapper()

        // Get existing history or create new list
        val historyString = jobDataMap.getString("executionHistory")
        val typeRef = mapper.typeFactory.constructCollectionType(MutableList::class.java, Map::class.java)
        val historyList: MutableList<Map<String, Any?>> = historyString?.let {
            mapper.readValue(it, typeRef) as? MutableList<Map<String, Any?>>
        } ?: mutableListOf()

        // Add current execution to history (limit to 30 entries)
        val executionRecord = mutableMapOf(
            "timestamp" to startTime.time,
            "endTimestamp" to endTime.time,
            "archivedCount" to archivedCount,
            "errors" to errors.toList(),
            "report" to report,
            "isManual" to isManualMode,
        )

        if (!isManualMode) {
            executionRecord["archiveAfterMonths"] = archiveAfterMonths
        }

        historyList.add(0, executionRecord) // Add to beginning (most recent first)
        if (historyList.size > 30) {
            historyList.removeAt(historyList.size - 1) // Remove oldest if > 30
        }

        // Store updated history back to JobDataMap
        jobDataMap.put("executionHistory", mapper.writeValueAsString(historyList))
        jobDataMap["startTime"] = startTime
        jobDataMap["endTime"] = endTime
        jobDataMap.put("progress", archivedCount)
        jobDataMap.put("errors", mapper.writeValueAsString(errors))
    }
}
