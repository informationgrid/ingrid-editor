/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api

import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.model.FileInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.services.PermissionInfo
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.core.Authentication
import java.time.Instant
import java.time.temporal.ChronoUnit

class UploadApiControllerTest : AnnotationSpec() {

    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    @MockkBean(relaxed = true)
    private lateinit var storage: Storage

    @MockkBean(relaxed = true)
    private lateinit var aclService: IgeAclService

    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    private lateinit var uploadApiController: UploadApiController
    private lateinit var principal: Authentication

    @BeforeAll
    fun setup() {
        catalogService = mockk(relaxed = true)
        storage = mockk(relaxed = true)
        aclService = mockk(relaxed = true)
        documentService = mockk(relaxed = true)
        principal = mockk(relaxed = true)

        every { catalogService.getCurrentCatalogForPrincipal(any()) } returns "catalog1"
        every { principal.name } returns "user1"
        every { storage.exists(any(), any(), any(), any()) } returns false
        val mockWrapper = mockk<DocumentWrapper>(relaxed = true)
        every { mockWrapper.id } returns 1
        every { documentService.getWrapperByCatalogAndDocumentUuid(any(), any()) } returns mockWrapper
        every { aclService.getPermissionInfo(any(), any()) } returns PermissionInfo(canRead = true, canWrite = true)

        uploadApiController = UploadApiController(
            catalogService,
            storage,
            aclService,
            documentService,
        )
    }

    @Test
    fun `upload should cleanup state on chunk checksum mismatch so that retry succeeds`() {
        val flowIdentifier = "test-flow-1"
        val chunk1Bytes = "chunk-1-content".toByteArray()
        val chunk1Checksum = FileInfo.sha256(chunk1Bytes.inputStream())

        val mockFile = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes)

        // Upload with incorrect checksum returns a retryable response.
        val checksumMismatchResponse = uploadApiController.uploadFile(
            principal = principal,
            docUuid = "doc-1",
            file = mockFile,
            replace = false,
            flowChunkNumber = 1,
            flowTotalChunks = 1,
            flowCurrentChunkSize = chunk1Bytes.size.toLong(),
            flowTotalSize = chunk1Bytes.size.toLong(),
            flowIdentifier = flowIdentifier,
            flowFilename = "test.txt",
            chunkChecksum = "wrong-checksum",
            combinedChecksum = null,
        )
        checksumMismatchResponse.statusCode shouldBe HttpStatus.UNPROCESSABLE_CONTENT

        // State for flowIdentifier should be cleaned up: chunkExists should return 204 No Content
        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT

        // Now retry with correct checksum -> should succeed
        every {
            storage.combineParts(any(), any(), any(), any(), any(), any(), any(), any())
        } returns arrayOf(mockk<FileSystemItem>(relaxed = true))

        val response = uploadApiController.uploadFile(
            principal = principal,
            docUuid = "doc-1",
            file = mockFile,
            replace = false,
            flowChunkNumber = 1,
            flowTotalChunks = 1,
            flowCurrentChunkSize = chunk1Bytes.size.toLong(),
            flowTotalSize = chunk1Bytes.size.toLong(),
            flowIdentifier = flowIdentifier,
            flowFilename = "test.txt",
            chunkChecksum = chunk1Checksum,
            combinedChecksum = FileInfo.sha256(chunk1Checksum.byteInputStream()),
        )

        response.statusCode shouldBe HttpStatus.CREATED
        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT
    }

    @Test
    fun `upload should cleanup state on combined checksum mismatch`() {
        val flowIdentifier = "test-flow-2"
        val chunk1Bytes = "chunk-1-content".toByteArray()
        val chunk1Checksum = FileInfo.sha256(chunk1Bytes.inputStream())

        val mockFile = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes)

        val response = uploadApiController.uploadFile(
            principal = principal,
            docUuid = "doc-1",
            file = mockFile,
            replace = false,
            flowChunkNumber = 1,
            flowTotalChunks = 1,
            flowCurrentChunkSize = chunk1Bytes.size.toLong(),
            flowTotalSize = chunk1Bytes.size.toLong(),
            flowIdentifier = flowIdentifier,
            flowFilename = "test.txt",
            chunkChecksum = chunk1Checksum,
            combinedChecksum = "wrong-combined-checksum",
        )
        response.statusCode shouldBe HttpStatus.BAD_REQUEST

        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT
        // parts of the failed attempt are never combined, so they have to be removed right away
        verify(exactly = 1) { storage.deleteParts(flowIdentifier, 1) }
    }

    @Test
    fun `uploads of different attempts should not share chunk state`() {
        val flowIdentifier = "test-flow-attempts"
        val chunk1Bytes = "part1".toByteArray()
        val chunk2Bytes = "part2".toByteArray()
        val chunk1Checksum = FileInfo.sha256(chunk1Bytes.inputStream())
        val chunk2Checksum = FileInfo.sha256(chunk2Bytes.inputStream())
        val combinedChecksum = FileInfo.sha256((chunk1Checksum + chunk2Checksum).byteInputStream())

        val mockFile1 = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes)
        val mockFile2 = MockMultipartFile("file", "test.txt", "text/plain", chunk2Bytes)

        val combinedUploadKeys = mutableListOf<String>()
        every {
            storage.combineParts(any(), any(), any(), any(), capture(combinedUploadKeys), any(), any(), any())
        } returns arrayOf(mockk<FileSystemItem>(relaxed = true))

        // first attempt is aborted after the first of two chunks
        val abortedResponse = uploadChunk(
            flowIdentifier = flowIdentifier,
            file = mockFile1,
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            chunkChecksum = chunk1Checksum,
            uploadAttempt = "attempt-1",
        )
        abortedResponse.statusCode shouldBe HttpStatus.CREATED

        // the last chunk of the retry must not complete the state of the aborted attempt
        val retryLastChunkResponse = uploadChunk(
            flowIdentifier = flowIdentifier,
            file = mockFile2,
            flowChunkNumber = 2,
            flowTotalChunks = 2,
            chunkChecksum = chunk2Checksum,
            combinedChecksum = combinedChecksum,
            uploadAttempt = "attempt-2",
        )
        retryLastChunkResponse.statusCode shouldBe HttpStatus.CREATED
        combinedUploadKeys shouldBe emptyList()

        // only the complete retry is merged, using its own parts
        val retryResponse = uploadChunk(
            flowIdentifier = flowIdentifier,
            file = mockFile1,
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            chunkChecksum = chunk1Checksum,
            uploadAttempt = "attempt-2",
        )
        retryResponse.statusCode shouldBe HttpStatus.CREATED
        combinedUploadKeys shouldBe listOf("$flowIdentifier-attempt-2")
    }

    @Test
    fun `upload with invalid upload attempt should be rejected`() {
        val chunk1Bytes = "chunk-1-content".toByteArray()
        val mockFile = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes)

        val response = uploadChunk(
            flowIdentifier = "test-flow-invalid-attempt",
            file = mockFile,
            flowChunkNumber = 1,
            flowTotalChunks = 1,
            chunkChecksum = FileInfo.sha256(chunk1Bytes.inputStream()),
            uploadAttempt = "../../etc/passwd",
        )

        response.statusCode shouldBe HttpStatus.BAD_REQUEST
    }

    @Test
    fun `eviction should remove the state of abandoned uploads`() {
        val flowIdentifier = "test-flow-evict"
        val chunk1Bytes = "part1".toByteArray()
        val chunk2Bytes = "part2".toByteArray()
        val chunk1Checksum = FileInfo.sha256(chunk1Bytes.inputStream())
        val chunk2Checksum = FileInfo.sha256(chunk2Bytes.inputStream())
        val combinedChecksum = FileInfo.sha256((chunk1Checksum + chunk2Checksum).byteInputStream())

        val combinedUploadKeys = mutableListOf<String>()
        every {
            storage.combineParts(any(), any(), any(), any(), capture(combinedUploadKeys), any(), any(), any())
        } returns arrayOf(mockk<FileSystemItem>(relaxed = true))

        uploadChunk(
            flowIdentifier = flowIdentifier,
            file = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes),
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            chunkChecksum = chunk1Checksum,
        ).statusCode shouldBe HttpStatus.CREATED
        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.OK

        uploadApiController.evictStaleUploads(Instant.now().plus(25, ChronoUnit.HOURS))

        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT

        // the state is really gone: the last chunk alone does not finish the upload anymore
        uploadChunk(
            flowIdentifier = flowIdentifier,
            file = MockMultipartFile("file", "test.txt", "text/plain", chunk2Bytes),
            flowChunkNumber = 2,
            flowTotalChunks = 2,
            chunkChecksum = chunk2Checksum,
            combinedChecksum = combinedChecksum,
        ).statusCode shouldBe HttpStatus.CREATED
        combinedUploadKeys shouldBe emptyList()

        uploadApiController.evictStaleUploads(Instant.now().plus(25, ChronoUnit.HOURS))
    }

    @Test
    fun `eviction should keep the state of running uploads`() {
        val flowIdentifier = "test-flow-evict-running"
        val chunkBytes = "part1".toByteArray()

        uploadChunk(
            flowIdentifier = flowIdentifier,
            file = MockMultipartFile("file", "test.txt", "text/plain", chunkBytes),
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            chunkChecksum = FileInfo.sha256(chunkBytes.inputStream()),
        ).statusCode shouldBe HttpStatus.CREATED

        uploadApiController.evictStaleUploads(Instant.now())

        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.OK

        uploadApiController.evictStaleUploads(Instant.now().plus(25, ChronoUnit.HOURS))
    }

    @Test
    fun `eviction should be disabled by a retention time of zero`() {
        val flowIdentifier = "test-flow-evict-disabled"
        val chunkBytes = "part1".toByteArray()

        uploadChunk(
            flowIdentifier = flowIdentifier,
            file = MockMultipartFile("file", "test.txt", "text/plain", chunkBytes),
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            chunkChecksum = FileInfo.sha256(chunkBytes.inputStream()),
        ).statusCode shouldBe HttpStatus.CREATED

        uploadApiController.attemptRetentionTime = 0
        try {
            uploadApiController.evictStaleUploads(Instant.now().plus(365, ChronoUnit.DAYS))
            uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.OK
        } finally {
            uploadApiController.attemptRetentionTime = 24
        }

        uploadApiController.evictStaleUploads(Instant.now().plus(25, ChronoUnit.HOURS))
    }

    @Test
    fun `multi chunk upload should track chunks until finished and clean up`() {
        val flowIdentifier = "test-flow-multi"
        val chunk1Bytes = "part1".toByteArray()
        val chunk2Bytes = "part2".toByteArray()
        val chunk1Checksum = FileInfo.sha256(chunk1Bytes.inputStream())
        val chunk2Checksum = FileInfo.sha256(chunk2Bytes.inputStream())
        val combinedChecksum = FileInfo.sha256((chunk1Checksum + chunk2Checksum).byteInputStream())

        val mockFile1 = MockMultipartFile("file", "test.txt", "text/plain", chunk1Bytes)
        val mockFile2 = MockMultipartFile("file", "test.txt", "text/plain", chunk2Bytes)

        every {
            storage.combineParts(any(), any(), any(), any(), any(), any(), any(), any())
        } returns arrayOf(mockk<FileSystemItem>(relaxed = true))

        // Upload chunk 1
        val response1 = uploadApiController.uploadFile(
            principal = principal,
            docUuid = "doc-1",
            file = mockFile1,
            replace = false,
            flowChunkNumber = 1,
            flowTotalChunks = 2,
            flowCurrentChunkSize = chunk1Bytes.size.toLong(),
            flowTotalSize = (chunk1Bytes.size + chunk2Bytes.size).toLong(),
            flowIdentifier = flowIdentifier,
            flowFilename = "test.txt",
            chunkChecksum = chunk1Checksum,
            combinedChecksum = null,
        )
        response1.statusCode shouldBe HttpStatus.CREATED
        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.OK
        uploadApiController.chunkExists(2, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT

        // Upload chunk 2
        val response2 = uploadApiController.uploadFile(
            principal = principal,
            docUuid = "doc-1",
            file = mockFile2,
            replace = false,
            flowChunkNumber = 2,
            flowTotalChunks = 2,
            flowCurrentChunkSize = chunk2Bytes.size.toLong(),
            flowTotalSize = (chunk1Bytes.size + chunk2Bytes.size).toLong(),
            flowIdentifier = flowIdentifier,
            flowFilename = "test.txt",
            chunkChecksum = chunk2Checksum,
            combinedChecksum = combinedChecksum,
        )
        response2.statusCode shouldBe HttpStatus.CREATED
        uploadApiController.chunkExists(1, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT
        uploadApiController.chunkExists(2, flowIdentifier).statusCode shouldBe HttpStatus.NO_CONTENT
    }

    private fun uploadChunk(
        flowIdentifier: String,
        file: MockMultipartFile,
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        chunkChecksum: String,
        combinedChecksum: String? = null,
        uploadAttempt: String? = null,
    ) = uploadApiController.uploadFile(
        principal = principal,
        docUuid = "doc-1",
        file = file,
        replace = false,
        flowChunkNumber = flowChunkNumber,
        flowTotalChunks = flowTotalChunks,
        flowCurrentChunkSize = file.size,
        flowTotalSize = file.size,
        flowIdentifier = flowIdentifier,
        flowFilename = "test.txt",
        chunkChecksum = chunkChecksum,
        combinedChecksum = combinedChecksum,
        uploadAttempt = uploadAttempt,
    )
}
