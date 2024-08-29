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
package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.nio.file.Paths

@Component
class UploadCleanupTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager,
) {
    val log = logger()

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
