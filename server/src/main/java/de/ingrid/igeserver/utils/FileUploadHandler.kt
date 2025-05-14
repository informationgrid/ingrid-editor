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
package de.ingrid.igeserver.utils

import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.SequenceInputStream
import java.nio.file.Path
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import kotlin.io.path.createTempDirectory

@Service
class FileUploadHandler {

    private val tempDirectories: ConcurrentHashMap<String, Path> = ConcurrentHashMap()

    /**
     * Handles file upload by processing individual file chunks.
     *
     * This method stores incoming file chunks temporarily and checks whether all chunks of a file
     * have been uploaded. Once all chunks have been uploaded, it combines them to reconstruct the
     * complete file and removes the temporary storage.
     *
     * @param file The current chunk of the file to be uploaded, represented as a MultipartFile.
     * @param flowChunkNumber The sequence number of the current chunk (1-based index).
     * @param flowTotalChunks The total number of chunks that make up the complete file.
     * @param flowIdentifier A unique identifier for the file upload process.
     * @param flowFilename The original filename of the file being uploaded.
     * @return The Path to the complete combined file if all chunks are uploaded, or null if more chunks are pending.
     */
    @Synchronized
    fun handleChunk(
        file: MultipartFile,
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        flowIdentifier: String,
        flowFilename: String,
    ): Path? {
        var tempDir: Path? = tempDirectories[flowIdentifier]
        if (tempDir == null) {
            tempDir = createTempDirectory("import-chunks-$flowIdentifier")
            tempDirectories[flowIdentifier] = tempDir
        } else {
            // remove file if it already has been uploaded before
            if (tempDir.toFile().exists() && flowChunkNumber == 1) {
                val deleted = tempDir.toFile().listFiles()?.all { it.delete() } ?: true
                if (!deleted) {
                    throw IllegalStateException("Could not delete all files in temporary directory")
                }
            }
        }

        // Save chunk
        val chunkFile = tempDir.resolve("$flowChunkNumber")
        file.transferTo(chunkFile)

        // Check if all chunks are uploaded
        if (tempDir.toFile().listFiles()?.size == flowTotalChunks) {
            val combinedFile = tempDir.resolve(flowFilename)
            val chunkFiles = tempDir.toFile().listFiles()
                ?.sortedBy { it.name.toInt() }
                ?: throw IllegalStateException("Chunk files not found or empty.")

            SequenceInputStream(
                Vector(chunkFiles.map { it.inputStream() }).elements(),
            ).use { sequenceInputStream ->
                combinedFile.toFile().outputStream().use { output ->
                    sequenceInputStream.copyTo(output, DEFAULT_BUFFER_SIZE)
                }
            }

            return combinedFile
        }

        // Return null if not all chunks are uploaded yet
        return null
    }

    /**
     * Cleans up temporary resources associated with a specific file upload process.
     *
     * This method deletes any temporary directories and files created during the file upload
     * process for the given identifier. It also removes the identifier from the internal
     * tracking structure.
     *
     * WARNING: This also removes the combined file if it wasn't moved before
     *
     * @param flowIdentifier A unique identifier representing a specific file upload process.
     *                        This identifier is used to locate and clean up associated temporary
     *                        resources.
     */
    fun cleanup(flowIdentifier: String) {
        tempDirectories[flowIdentifier]?.toFile()?.deleteRecursively()
        tempDirectories.remove(flowIdentifier)
    }
}
