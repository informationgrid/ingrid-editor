package de.ingrid.igeserver.tasks

import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.nio.file.Paths

@Profile("uvp")
@Component
class UploadCleanupTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager
) {
    companion object {
        private val log = LogManager.getLogger()
    }

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun cleanup() {
        log.info("Starting Task: Upload-Cleanup")
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
        log.debug("Task finished: Upload-Cleanup")
    }

}
