package de.ingrid.igeserver.api

import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.mdek.upload.ConflictException
import de.ingrid.mdek.upload.UploadResponse
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.StorageItem
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
import java.io.UncheckedIOException
import java.security.Principal
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response
import de.ingrid.igeserver.model.FileInfo
import de.ingrid.mdek.upload.storage.ConflictHandling
import java.net.URLDecoder
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping(path = ["/api"])
class UploadApiController @Autowired constructor(
    private val catalogService: CatalogService,
    private val storage: Storage,
    private val aclService: IgeAclService
) : UploadApi {
    private val logger = logger()
    private val fileInfos: ConcurrentHashMap<String, FileInfo> = ConcurrentHashMap()

    override fun chunkExists(flowChunkNumber: Int, flowIdentifier: String?): ResponseEntity<Void> {
        val fileInfo = this.fileInfos.get(flowIdentifier)
        if (fileInfo != null && fileInfo.containsChunk(flowChunkNumber)) {
            return ResponseEntity.ok().build()
        }
        return ResponseEntity.noContent().build()
    }

    override fun uploadFile(
        principal: Principal, docId: String,
        file: MultipartFile,
        replace: Boolean,
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        flowCurrentChunkSize: Long,
        flowTotalSize: Long,
        flowIdentifier: String,
        flowFilename: String,
    ): ResponseEntity<UploadResponse> {
        val canWrite = aclService.getPermissionInfo(principal as Authentication, docId).canWrite
        if (!canWrite) {
            val uploadResponse = UploadResponse(ForbiddenException.withAccessRights("No access to referenced dataset"))
            return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.FORBIDDEN)
        }

        val userID = principal.getName()
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val size = flowTotalSize

        // check filename
        try {
            storage.validate(catalogId, userID, docId, flowFilename, size)
        } catch (ex: Exception) {
            return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.INTERNAL_SERVER_ERROR)
        }

        // check if file exists already
        if (!replace) {
            if (storage.exists(catalogId, userID, docId, flowFilename)) {
                val items: Array<StorageItem> =
                    arrayOf<StorageItem>(storage.getInfo(catalogId, userID, docId, flowFilename))

                val uploadResponse =
                    UploadResponse(ConflictException("The file already exists.", items, items[0].getNextName()))
                return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CONFLICT)
                //throw ConflictException("The file already exists.", items, items[0].getNextName())
            }
        }

        var files: Array<StorageItem> = arrayOf()

        var fileInfo: FileInfo? = this.fileInfos.get(flowIdentifier)
        if (fileInfo == null) {
            fileInfo = FileInfo()
            this.fileInfos.put(flowIdentifier, fileInfo)
        }

        storage.writePart(flowIdentifier, flowChunkNumber, file.inputStream, flowCurrentChunkSize)


        fileInfo.addUploadedChunk(flowChunkNumber)

        if (fileInfo.isUploadFinished(flowTotalChunks)) {
            // store file
            try {
                files = storage.combineParts(
                    catalogId,
                    userID,
                    docId,
                    flowFilename,
                    flowIdentifier,
                    flowTotalChunks,
                    size,
                    replace
                )
            }  catch (ex: Exception) {
                return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.INTERNAL_SERVER_ERROR)
            } finally {
                this.fileInfos.remove(flowIdentifier)
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
        // get first URI for location header
        val createdFile = if (files.size > 0) files[0].getUri() else ""

        // build response
        val uploadResponse = UploadResponse(Arrays.asList(*files))
        return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CREATED)
    }

    override fun extractFile(
        principal: Principal,
        docId: String,
        file: String,
        conflictHandling: ConflictHandling
    ): ResponseEntity<UploadResponse> {
        val canWrite = aclService.getPermissionInfo(principal as Authentication, docId).canWrite
        if (!canWrite) {
            val uploadResponse = UploadResponse(ForbiddenException.withAccessRights("No access to referenced dataset"))
            return ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.FORBIDDEN)
        }

        val userID = principal.getName()
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        if(conflictHandling != ConflictHandling.RENAME && conflictHandling != ConflictHandling.REPLACE){
            try{
                storage.checkExtractConflicts(catalogId, userID, docId, file)
            }
            catch (ex: ConflictException){
                return ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.CONFLICT)
            }
        }

        val files = storage.extract(catalogId, userID, docId, file, conflictHandling)

        return this.createUploadResponse(files)

    }

    override fun getFile(
        request: HttpServletRequest,
        principal: Principal,
        docId: String
    ): ResponseEntity<StreamingResponseBody> {
        val requestURI = request.requestURI

        val idx = requestURI.indexOf(docId)
        val file = URLDecoder.decode(requestURI.substring(idx + docId.length + 1), "UTF-8")

        val canRead = aclService.getPermissionInfo(principal as Authentication, docId).canRead
        if (!canRead) {
            throw ForbiddenException.withAccessRights("No access to referenced dataset")
        }

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        // read file
        val fileStream = StreamingResponseBody { output ->
            try {
                this.storage.read(catalogId, principal.getName(), docId, file).use { data ->
                    IOUtils.copy(data, output)
                    output.flush()
                }
            } catch (ex: IOException) {
                throw UncheckedIOException(ex)
            }
        }

        // build response
        val response = Response.ok(fileStream, MediaType.APPLICATION_OCTET_STREAM)
        response.header("Content-Disposition", "attachment; filename=\"$file\"")
        response.header("Content-Length", storage.getInfo(catalogId, principal.getName(), docId, file).getSize())
        return ResponseEntity<StreamingResponseBody>(fileStream, HttpStatus.OK)
    }

    override fun deleteFile(principal: Principal, docId: String, file: String): ResponseEntity<Unit> {
        val canWrite = aclService.getPermissionInfo(principal as Authentication, docId).canWrite
        if (!canWrite) {
            throw ForbiddenException.withAccessRights("No access to referenced dataset")
        }

        val userID = principal.getName()
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        this.storage.delete(catalogId, userID, docId, file);

        return ResponseEntity.ok().build()
    }
}
