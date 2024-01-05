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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FileInfo
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.mdek.upload.ConflictException
import de.ingrid.mdek.upload.UploadResponse
import de.ingrid.mdek.upload.storage.ConflictHandling
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.StorageItem
import jakarta.servlet.http.HttpServletRequest
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.apache.commons.io.IOUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.io.IOException
import java.net.URLDecoder
import java.security.Principal
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@RestController
@RequestMapping(path = ["/api"])
class UploadApiController(
    private val catalogService: CatalogService,
    private val storage: Storage,
    private val aclService: IgeAclService,
    private val documentService: DocumentService
) : UploadApi {

    private val fileInfos: ConcurrentHashMap<String, FileInfo> = ConcurrentHashMap()
    private val log = logger()

    override fun chunkExists(flowChunkNumber: Int, flowIdentifier: String?): ResponseEntity<Void> {
        val fileInfo = this.fileInfos[flowIdentifier]
        if (fileInfo != null && fileInfo.containsChunk(flowChunkNumber)) {
            return ResponseEntity.ok().build()
        }
        return ResponseEntity.noContent().build()
    }

    override fun uploadFile(
        principal: Principal,
        docUuid: String,
        file: MultipartFile,
        replace: Boolean,
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        flowCurrentChunkSize: Long,
        flowTotalSize: Long,
        flowIdentifier: String,
        flowFilename: String,
    ): ResponseEntity<UploadResponse> {
        log.info("Uploading file '$flowFilename' for document $docUuid")
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        checkWritePermission(catalogId, docUuid, principal as Authentication)

        val userID = principal.getName()

        // TODO: remove validation, check if filename can be invalid
        // check filename
        try {
            storage.validate(catalogId, userID, docUuid, flowFilename, flowTotalSize)
        } catch (ex: Exception) {
            log.warn("Validation failed for file: $flowFilename")
            log.warn("Validation error: ${ex.message}")
            return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.INTERNAL_SERVER_ERROR)
        }

        // check if file exists already
        if (!replace) {
            if (storage.exists(catalogId, userID, docUuid, flowFilename)) {
                log.info("File already exists: $flowFilename");
                val items = arrayOf(storage.getInfo(catalogId, userID, docUuid, flowFilename))

                val uploadResponse =
                    UploadResponse(ConflictException("The file already exists.", items, items[0].nextName))
                return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CONFLICT)
            }
        }

        var files: Array<StorageItem> = arrayOf()

        // Since multiple chunks are uploaded in parallel the fileInfo-object also
        // can be updated/created in parallel. This can lead to problem determining the end of an upload,
        // when we do not have the latest state of the already uploaded chunks.
        synchronized(this) {
            var fileInfo: FileInfo? = this.fileInfos[flowIdentifier]
            if (fileInfo == null) {
                fileInfo = FileInfo()
                this.fileInfos[flowIdentifier] = fileInfo
            }

            storage.writePart(flowIdentifier, flowChunkNumber, file.inputStream, flowCurrentChunkSize)

            fileInfo.addUploadedChunk(flowChunkNumber)

            if (fileInfo.isUploadFinished(flowTotalChunks)) {
                log.info("Merging parts of uploaded file: $flowFilename")
                // store file
                try {
                    files = storage.combineParts(
                        catalogId,
                        userID,
                        docUuid,
                        flowFilename,
                        flowIdentifier,
                        flowTotalChunks,
                        flowTotalSize,
                        replace
                    )
                    log.info("Upload complete: $flowFilename")
                } catch (ex: Exception) {
                    log.error("Error uploading file $flowFilename", ex)
                    return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.INTERNAL_SERVER_ERROR)
                } finally {
                    this.fileInfos.remove(flowIdentifier)
                }
            }
        }
        return this.createUploadResponse(files)
    }


    /**
     * Create the upload response from a list of files
     *
     * @param files
     * @return Response
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun createUploadResponse(files: Array<StorageItem>): ResponseEntity<UploadResponse> {
        // build response
        val uploadResponse = UploadResponse(listOf(*files))
        return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CREATED)
    }

    override fun extractFile(
        principal: Principal,
        docUuid: String,
        file: String,
        conflictHandling: ConflictHandling
    ): ResponseEntity<UploadResponse> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        checkWritePermission(catalogId, docUuid, principal as Authentication)

        val userID = principal.getName()

        if (conflictHandling != ConflictHandling.RENAME && conflictHandling != ConflictHandling.REPLACE) {
            try {
                storage.checkExtractConflicts(catalogId, userID, docUuid, file)
            } catch (ex: ConflictException) {
                return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.CONFLICT)
            }
        }

        val files = storage.extract(catalogId, userID, docUuid, file, conflictHandling)

        return this.createUploadResponse(files)

    }

    data class StorageParameters(
        val catalog: String,
        val userID: String,
        val datasetID: String,
        val file: String
    )

    private val downloadHashCache = Collections.synchronizedMap(object : LinkedHashMap<String, StorageParameters>() {
        val maxSize = 500
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, StorageParameters>?): Boolean {
            return size > maxSize
        }
    })

    override fun getFileDownloadHash(
        request: HttpServletRequest,
        principal: Principal,
        docUuid: String
    ): ResponseEntity<String> {
        val requestURI = request.requestURI

        val idx = requestURI.indexOf(docUuid)
        val file = URLDecoder.decode(requestURI.substring(idx + docUuid.length + 1), "UTF-8")

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        checkReadPermission(catalogId, docUuid, principal as Authentication)

        val info = StorageParameters(catalogId, principal.getName(), docUuid, file)
        if (storage.exists(info.catalog, info.userID, info.datasetID, info.file).not()
            && storage.isArchived(info.catalog, info.datasetID, info.file).not()
        ) {
            throw NotFoundException.withMissingResource(info.file, "file")
        }

        val hash = UUID.randomUUID().toString()
        downloadHashCache[hash] = info
        return ResponseEntity<String>(hash, HttpStatus.OK)
    }

    override fun getFileByHash(
        request: HttpServletRequest,
        hash: String
    ): ResponseEntity<StreamingResponseBody> {
        val params = downloadHashCache[hash] ?: throw NotFoundException.withMissingHash(hash)
        downloadHashCache.remove(hash)

        // read file
        val fileStream = StreamingResponseBody { output ->
            try {
                this.storage.read(params.catalog, params.userID, params.datasetID, params.file).use { data ->
                    IOUtils.copy(data, output)
                    output.flush()
                }
            } catch (ex: IOException) {
                throw NotFoundException.withMissingResource(params.file, "file")
            }
        }

        // build response
        val response = Response.ok(fileStream, MediaType.APPLICATION_OCTET_STREAM)
        response.header("Content-Disposition", "attachment; filename=\"${params.file}\"")
        response.header(
            "Content-Length",
            storage.getInfo(params.catalog, params.userID, params.datasetID, params.file).size
        )
        return ResponseEntity<StreamingResponseBody>(fileStream, HttpStatus.OK)
    }

    override fun deleteFile(principal: Principal, docUuid: String, file: String): ResponseEntity<Unit> {
        log.info("Unsaved file is going to be deleted: $docUuid/$file")
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        checkWritePermission(catalogId, docUuid, principal as Authentication)

        val userID = principal.getName()

        this.storage.deleteUnsavedFile(catalogId, userID, docUuid, file)

        return ResponseEntity.ok().build()
    }

    private fun checkWritePermission(catalogId: String, docUuid: String, principal: Authentication) {
        val docId = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, docUuid).id
        val canWrite = aclService.getPermissionInfo(principal, docId).canWrite
        if (!canWrite) {
            throw ForbiddenException.withAccessRights("No access to referenced dataset")
        }
    }

    private fun checkReadPermission(catalogId: String, docUuid: String, principal: Authentication) {
        val docId = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, docUuid).id
        val canRead = aclService.getPermissionInfo(principal, docId).canRead
        if (!canRead) {
            throw ForbiddenException.withAccessRights("No access to referenced dataset")
        }
    }
}
