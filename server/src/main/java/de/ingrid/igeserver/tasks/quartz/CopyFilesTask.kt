/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.messaging.CopyFilesMessage
import de.ingrid.igeserver.api.messaging.CopyFilesNotifier
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import java.io.IOException
import java.io.UncheckedIOException
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.util.*

@Component
@PersistJobDataAfterExecution
class CopyFilesTask(
    private val notify: CopyFilesNotifier,
    private val fileStore: FileSystemStorage,
) : IgeJob() {

    companion object {
        const val JOB_KEY: String = "copy-files"
    }

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        copyFiles(context)
    }

    private fun copyFiles(context: JobExecutionContext) {
        val catalogId = context.mergedJobDataMap.getString("catalogId")
        val docsDir = context.mergedJobDataMap.getString("docsDir")
        val sourceDatasetId = context.mergedJobDataMap.getString("sourceDatasetId")
        val targetDatasetId = context.mergedJobDataMap.getString("targetDatasetId")

        log.info("Starting Task: Copy files from dataset $sourceDatasetId to $targetDatasetId")
        val message = CopyFilesMessage(catalogId, sourceDatasetId, targetDatasetId)
        try {
            val files = listOf(Scope.UNPUBLISHED, Scope.ARCHIVED, Scope.ARCHIVED_UNPUBLISHED, Scope.PUBLISHED).map {
                fileStore.listFiles(catalogId, null, sourceDatasetId, docsDir, it)
            }.flatten()
            message.totalFiles = files.size

            val copyOptions = arrayOf(StandardCopyOption.REPLACE_EXISTING)
            files.forEach { file ->
                try {
                    log.debug("Copying file ${file.file}")
                    notify.sendMessage(
                        message.apply { currentFile = file.file },
                    )
                    val existingFile = file.getRealPath()
                    val targetPath = fileStore.getUnpublishedPath(catalogId, targetDatasetId, file.getRelativePath(), docsDir)
                    Files.createDirectories(targetPath.parent)
                    Files.copy(existingFile, targetPath, *copyOptions)
                    notify.sendMessage(
                        message.apply { increaseProgress() },
                    )
                } catch (ex: IOException) {
                    throw UncheckedIOException(ex)
                }
            }
        } catch (_: InterruptedException) {
            notify.addAndSendMessageError(message, null, "Copying files was cancelled")
        } catch (ex: Exception) {
            notify.addAndSendMessageError(message, ex, "Error during copying files: ")
            throw ex
        } catch (_: NotImplementedError) {
            notify.addAndSendMessageError(message, ServerException.withReason("Not Implemented"))
        }

        log.info("Finished task: Copy files from dataset $sourceDatasetId to $targetDatasetId")
        notify.sendMessage(
            message.apply { endTime = Date() },
        )

        // save last copying information to database for this catalog to get this in frontend
        finishJob(context, message)
    }
}
