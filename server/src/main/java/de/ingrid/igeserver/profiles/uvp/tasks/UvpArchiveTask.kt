/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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

import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.WrapperAndDocId
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveMessage
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveNotifier
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.time.OffsetDateTime
import java.util.Date

@Component
@PersistJobDataAfterExecution
class UvpArchiveTask(
    val transactionManager: PlatformTransactionManager,
    val entityManager: EntityManager,
    val uvpArchiveService: UvpArchiveService,
    val documentService: DocumentService,
    val notify: ArchiveNotifier,
) : IgeJob() {
    private val tableIds = listOf("announcementDocs", "applicationDocs", "reportsRecommendationDocs", "furtherDocs", "considerationDocs", "approvalDocs")
    private val tableIdsDecision = listOf("decisionDocs")
    override val log = logger()

    companion object {
        const val JOB_KEY: String = "uvp-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Archive")
        val type: ArchiveType = ArchiveType.valueOf(context.mergedJobDataMap["type"] as String)
        val date = OffsetDateTime.parse(context.mergedJobDataMap["date"] as String)
        val catalogId = context.mergedJobDataMap["catalogId"] as String

        // get all docs whose decision date is before a given date
        val message = ArchiveMessage(catalogId)
        notify.sendMessage(
            message.apply { this.message = "Start Indexing for catalog: $catalogId" },
        )
        val datasets = uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)

        setAdminAuthentication("UVPArchive", "Task")

        ClosableTransaction(transactionManager).use {
            // modify valid date for documents according to selected option
            when (type) {
                ArchiveType.HIDE_ALL -> handleHideAll(datasets)
                ArchiveType.SHOW_ALL -> {} // do nothing
                ArchiveType.SHOW_ONLY_DECISION -> handleShowOnlyDecision(datasets)
            }
            archiveDatasets(datasets, catalogId, message)

            notify.sendMessage(
                message.apply { this.endTime = Date() },
            )
        }
    }

    private fun archiveDatasets(datasets: List<WrapperAndDocId>, catalogId: String, message: ArchiveMessage) {
        datasets.forEach {
            log.info("Archive document with wrapperId: ${it.wrapperId}")
            documentService.updateTags(catalogId, it.wrapperId, TagRequest(listOf("archived"), null))
            notify.sendMessage(
                message.apply { this.progress++ },
            )
        }
    }

    private fun handleShowOnlyDecision(datasets: List<WrapperAndDocId>) {
        datasets.forEach {
            tableIds.forEach { tableId ->
                entityManager.createNativeQuery(sqlUpdateValidDate(it.docId, tableId)).executeUpdate()
            }
        }
    }

    private fun handleHideAll(datasets: List<WrapperAndDocId>) {
        datasets.forEach {
            (tableIds + tableIdsDecision).forEach { tableId ->
                entityManager.createNativeQuery(sqlUpdateValidDate(it.docId, tableId)).executeUpdate()
            }
        }
    }
}
