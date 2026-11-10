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
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.core.Authentication

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
}
