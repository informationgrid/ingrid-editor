package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.UploadInfo
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId

@Profile("uvp")
@Component
class UploadExpiredTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager,
    val referenceHandler: UvpReferenceHandler
) {
    companion object {
        private val log = LogManager.getLogger()
    }

    data class Counter(var archived: Int, var restored: Int)

    @Scheduled(cron = "\${upload.expired.schedule}")
    fun scheduleStart() {
        start(null)
    }

    fun start(docId: Int? = null) {
        log.info("Starting Task: Upload-Expired")
        val docs = try {
            referenceHandler.getPublishedDocumentsByCatalog(docId)
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

    private fun restoreUvpFiles(uploads: DocumentLinks): Int {
        val today = LocalDate.now()
        return uploads.getDocsByLatestValidUntilDate()
            .filter { !isExpired(it, today) }
            .filter { fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .fold(0) { sum, element -> if (restoreFile(element, uploads)) sum + 1 else sum }
    }

    private fun archiveExpiredUvpFiles(uploads: DocumentLinks): Int {
        val today = LocalDate.now()
        return uploads.getDocsByLatestValidUntilDate()
            .filter { isExpired(it, today) }
            .filter { !fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .fold(0) { sum, element -> if (archiveFile(element, uploads)) sum + 1 else sum }
    }

    private fun archiveFile(
        uploadInfo: UploadInfo,
        uploads: DocumentLinks
    ): Boolean {
        return try {
            log.info("Archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
            fileSystemStorage.archive(uploads.catalogId, uploads.docUuid, uploadInfo.uri)
            true
        } catch (ex: Exception) {
            log.error("Could not archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}: ${ex.message}")
            false
        }
    }
    
    private fun restoreFile(
        uploadInfo: UploadInfo,
        uploads: DocumentLinks
    ): Boolean {
        return try {
            log.info("Restore file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
            fileSystemStorage.restore(uploads.catalogId, uploads.docUuid, uploadInfo.uri)
            true
        } catch (ex: Exception) {
            log.error("Could not restore file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}: ${ex.message}")
            false
        }
    }

    private fun isExpired(upload: UploadInfo, today: LocalDate) =
        upload.validUntil != null && today.isAfter(
            OffsetDateTime.parse(upload.validUntil).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate()
        )
}
