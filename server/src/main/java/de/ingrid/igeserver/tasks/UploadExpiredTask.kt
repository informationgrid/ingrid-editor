package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.profiles.uvp.UploadUtils
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import javax.annotation.PostConstruct
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class UploadExpiredTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager,
    val uploadUtils: UploadUtils
) {
    val log = logger()

    @PostConstruct
    fun init() = start()

    val sqlSteps = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.published = doc.id
    """.trimIndent()

    val sqlNegativeDecisionDocs = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.published = doc.id
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun scheduleStart() {
        log.info("Starting Upload-Expired - Task")
        start(null)
    }

    fun start(docId: Int? = null) {
        val docs = try {
            uploadUtils.getPublishedDocumentsByCatalog(docId)
        } catch (e: Exception) {
            log.error("Error getting published documents, which can be normal if database is empty: ${e.message}")
            emptyList()
        }

        docs.forEach {
            // remove expired documents
            archiveExpiredUvpFiles(it)

            // restore expired documents
            restoreUvpFiles(it)

            // remove unreferenced documents
//            deleteUnreferencedUvpFilesFromCatalog(it)
        }
    }

    private fun restoreUvpFiles(uploads: UploadUtils.PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestValidUntilDate()
            .filter { !isExpired(it, today) }
            .filter { fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .forEach {
                log.info("Restore file ${it.uri} from ${uploads.docUuid}")
                fileSystemStorage.restore(uploads.catalogId, uploads.docUuid, it.uri)
            }
    }

    private fun archiveExpiredUvpFiles(uploads: UploadUtils.PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestValidUntilDate()
            .filter { isExpired(it, today) }
            .filter { !fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .forEach { archiveFile(it, uploads) }
    }

    private fun archiveFile(
        uploadInfo: UploadUtils.UploadInfo,
        uploads: UploadUtils.PublishedUploads
    ) {
        try {
            log.info("Archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
            fileSystemStorage.archive(uploads.catalogId, uploads.docUuid, uploadInfo.uri)
        } catch (ex: Exception) {
            log.error("Could not archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
        }
    }

    private fun isExpired(upload: UploadUtils.UploadInfo, today: LocalDate) =
        upload.validUntil != null && today.isAfter(
            OffsetDateTime.parse(upload.validUntil).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate()
        )

}
