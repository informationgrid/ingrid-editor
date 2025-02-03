package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
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

@Component
@PersistJobDataAfterExecution
class UvpArchiveTask(
    val transactionManager: PlatformTransactionManager,
    val entityManager: EntityManager,
    val documentService: DocumentService,
) : IgeJob() {
    private val tableIds = listOf("announcementDocs", "applicationDocs", "reportsRecommendationDocs", "furtherDocs", "considerationDocs")
    private val tableIdsDecision = listOf("approvalDocs", "decisionDocs")
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
        val datasets = getDatasetsBeforeDecisionDate(catalogId, date)

        setAdminAuthentication("UVPArchive", "Task")

        ClosableTransaction(transactionManager).use {
            // modify valid date for documents according to selected option
            when (type) {
                ArchiveType.HIDE_ALL -> handleHideAll(datasets)
                ArchiveType.SHOW_ALL -> {} // do nothing
                ArchiveType.SHOW_ONLY_DECISION -> handleShowOnlyDecision(datasets)
            }

            archiveDatasets(datasets, catalogId)
        }
    }

    private fun archiveDatasets(datasets: List<WrapperAndDocId>, catalogId: String) {
        datasets.forEach {
            log.info("Archive document with wrapperId: ${it.wrapperId}")
            documentService.updateTags(catalogId, it.wrapperId, TagRequest(listOf("archived"), null))
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun getDatasetsBeforeDecisionDate(catalogId: String, date: OffsetDateTime): List<WrapperAndDocId> = entityManager.createNativeQuery(
        sqlDecisionDateBefore(catalogId, date),
        WrapperAndDocId::class.java,
    ).resultList as List<WrapperAndDocId>

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

    private data class WrapperAndDocId(val wrapperId: Int, val docId: Int)
}
