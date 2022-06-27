package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.nio.file.Paths
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class UploadCleanupTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager
) {
    val log = logger()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun cleanup() {
        log.info("Starting Upload-Cleanup - Task")
        val docsDir = fileSystemStorage.docsDir

        val trashPath = Paths.get(docsDir, FileSystemStorage.TRASH_PATH)
        val archivePath = Paths.get(docsDir, FileSystemStorage.ARCHIVE_PATH)
        val unsavedPath = Paths.get(docsDir, FileSystemStorage.UNSAVED_PATH)
        val unpublishedPath = Paths.get(docsDir, FileSystemStorage.UNPUBLISHED_PATH)

        // Delete old unsaved Files
        fileSystemStorage.deleteUnsavedFiles(unsavedPath)

        // Delete old Trash Files
        fileSystemStorage.deleteTrashFiles(trashPath)

        // run as long as there are empty directories
        fileSystemStorage.deleteEmptyDirs(trashPath, archivePath, unsavedPath, unpublishedPath)
    }

}
