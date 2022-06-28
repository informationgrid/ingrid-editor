package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.profiles.uvp.UploadUtils
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class UploadExpiredTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager,
    val uploadUtils: UploadUtils
) {
    val log = logger()

    data class Counter(var archived: Int, var restored: Int)

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun scheduleStart() {
        start(null)
    }

    fun start(docId: Int? = null) {
        log.info("Starting Task: Upload-Expired")
        val docs = try {
            uploadUtils.getPublishedDocumentsByCatalog(docId)
        } catch (e: Exception) {
            log.error("Error getting published documents, which can be normal if database is empty: ${e.message}")
            emptyList()
        }

        val count = Counter(0, 0)
        docs.forEach {
            // remove expired documents
            val countArchived = archiveExpiredUvpFiles(it)

            // restore expired documents
            val countRestored = restoreUvpFiles(it)

            count.archived += countArchived
            count.restored += countRestored
        }

        log.info("Archived: ${count.archived}; Restored: ${count.restored}")
        log.debug("Task finished: Upload-Expired")
    }

    private fun restoreUvpFiles(uploads: UploadUtils.PublishedUploads): Int {
        val today = LocalDate.now()
        return uploads.getDocsByLatestValidUntilDate()
            .filter { !isExpired(it, today) }
            .filter { fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .map {
                log.info("Restore file ${it.uri} from ${uploads.docUuid}")
                fileSystemStorage.restore(uploads.catalogId, uploads.docUuid, it.uri)
                1
            }
            .count()
    }

    private fun archiveExpiredUvpFiles(uploads: UploadUtils.PublishedUploads): Int {
        val today = LocalDate.now()
        return uploads.getDocsByLatestValidUntilDate()
            .filter { isExpired(it, today) }
            .filter { !fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .map { archiveFile(it, uploads); 1 }
            .count()
    }

    private fun archiveFile(
        uploadInfo: UploadUtils.UploadInfo,
        uploads: UploadUtils.PublishedUploads
    ) {
        try {
            log.info("Archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
            fileSystemStorage.archive(uploads.catalogId, uploads.docUuid, uploadInfo.uri)
        } catch (ex: Exception) {
            log.error("Could not archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}: ${ex.message}")
        }
    }

    private fun isExpired(upload: UploadUtils.UploadInfo, today: LocalDate) =
        upload.validUntil != null && today.isAfter(
            OffsetDateTime.parse(upload.validUntil).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate()
        )
}
