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
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.runAsAdmin
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.OffsetDateTime
import java.util.*

@Component
@PersistJobDataAfterExecution
class UvpArchiveTask(
    val transactionManager: PlatformTransactionManager,
    val uvpArchiveService: UvpArchiveService,
    val documentService: DocumentService,
    val notify: ArchiveNotifier,
) : IgeJob() {
    override val log = logger()

    companion object {
        const val JOB_KEY: String = "uvp-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Archive")
        val date = OffsetDateTime.parse(context.mergedJobDataMap["date"] as String)
        val catalogId = context.mergedJobDataMap["catalogId"] as String

        val startTime = Date()
        val message = ArchiveMessage(catalogId)
        notify.sendMessage(
            message.apply { this.message = "Start archiving for catalog: $catalogId" },
        )

        // get all docs whose decision date is before a given date
        val datasets = uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)

        runAsAdmin("UVPArchive", "Task") { principal ->
            ClosableTransaction(transactionManager).use {
                datasets.forEach {
                    documentService.archiveDocument(principal, catalogId, it.wrapperId)
                    message.progress++
                    notify.sendMessage(message)
                }
            }
        }

        val endTime = Date()
        message.endTime = endTime
        notify.sendMessage(message)

        // Store execution history in JobDataMap
        storeExecutionHistory(context, startTime, endTime, message.progress, message.errors, message.report)
    }

    private fun storeExecutionHistory(
        context: JobExecutionContext,
        startTime: Date,
        endTime: Date,
        archivedCount: Int,
        errors: MutableList<String>,
        report: Any?,
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
        val executionRecord = mapOf(
            "timestamp" to startTime.time,
            "endTimestamp" to endTime.time,
            "archivedCount" to archivedCount,
            "errors" to errors.toList(),
            "report" to report,
        )

        historyList.add(0, executionRecord) // Add to beginning (most recent first)
        if (historyList.size > 30) {
            historyList.removeAt(historyList.size - 1) // Remove oldest if > 30
        }

        // Store updated history back to JobDataMap
        jobDataMap.put("executionHistory", mapper.writeValueAsString(historyList))
        jobDataMap.put("startTime", startTime)
        jobDataMap.put("endTime", endTime)
        jobDataMap.put("progress", archivedCount)
        jobDataMap.put("errors", mapper.writeValueAsString(errors))
    }
}
