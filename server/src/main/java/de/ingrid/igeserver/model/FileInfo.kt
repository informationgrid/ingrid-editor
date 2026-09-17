/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.model

import java.io.InputStream
import java.security.MessageDigest
import java.util.*

class FileInfo(val flowTotalChunks: Int, val combinedChecksum: String) {
    private val uploadedChunks = mutableMapOf<Int, String>()

    fun isUploadFinished(): Boolean = uploadedChunks.size == flowTotalChunks

    fun containsChunk(flowChunkNumber: Int): Boolean = uploadedChunks.contains(flowChunkNumber)

    fun addUploadedChunk(flowChunkNumber: Int, checksum: String) {
        uploadedChunks[flowChunkNumber] = checksum
    }

    fun validateCombinedChecksum() {
        // ensure the checksums are in correct oder
        val combinedChecksums = (1..flowTotalChunks).joinToString("") { uploadedChunks.getValue(it) }
        require(combinedChecksums == combinedChecksum) { "Combined checksum mismatch: chunk order or content is incorrect" }
    }

    // TODO: move to utils?
    fun sha256(input: InputStream): String {
        val digest = MessageDigest.getInstance("SHA-256")
        input.use {
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            var count = it.read(buffer)
            while (count != -1) {
                digest.update(buffer, 0, count)
                count = it.read(buffer)
            }
        }
        return HexFormat.of().formatHex(digest.digest())
    }
}
