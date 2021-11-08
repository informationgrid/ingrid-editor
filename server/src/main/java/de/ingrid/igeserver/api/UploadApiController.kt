package de.ingrid.igeserver.api

import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.AuthUtils
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
import java.io.File
import java.io.IOException
import java.io.UncheckedIOException
import java.security.Principal
import java.util.*
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response

@RestController
@RequestMapping(path = ["/api"])
class UploadApiController  @Autowired constructor(
    private val catalogService: CatalogService,
    private val storage: Storage,
    private val aclService: IgeAclService
) : UploadApi {
    private val logger = logger()

    override fun uploadFile(principal: Principal, docId: String, file: MultipartFile, replace: Boolean): ResponseEntity<UploadResponse> {
        logger.info("Receiving file: " + file.originalFilename)

        val canWrite = aclService.getPermissionInfo(principal as Authentication, docId ?: "").canWrite
        if(!canWrite){
            val uploadResponse = UploadResponse(ForbiddenException.withAccessRights("No access to referenced dataset"))
            return  ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.FORBIDDEN)
        }

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val path = catalogId + File.separator+docId

        //val path = "path"//file.originalFilename
        val size = file.size

        // check filename
        try {
            storage.validate("UserID", path, file.originalFilename, size)
        } catch (ex: Exception) {
            return  ResponseEntity<UploadResponse>(UploadResponse(ex), HttpStatus.INTERNAL_SERVER_ERROR)
        }

        // check if file exists already
        if (storage.exists("UserID", path, file.originalFilename)) {
            val items: Array<StorageItem> = arrayOf<StorageItem>(storage.getInfo("UserID",  path, file.originalFilename))

            val uploadResponse = UploadResponse(ConflictException("The file already exists.", items, items[0].getNextName()))
            return  ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CONFLICT)
            //throw ConflictException("The file already exists.", items, items[0].getNextName())
        }

        var files: Array<StorageItem> = arrayOf<StorageItem>()
      //  val isPartialUpload = partsTotal != null
      //  if (isPartialUpload) {
      //      // store part
      //      storage.writePart(id, partsIndex, fileInputStream, partsSize)
      //  } else {
      //      // store file
            files = storage.write("UserID", path, file.originalFilename, file.inputStream, size, false)
      //  }
        return this.createUploadResponse(files)

        //return ResponseEntity(HttpStatus.OK)
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
        return  ResponseEntity<UploadResponse>(uploadResponse, HttpStatus.CREATED)
    }

    override fun getFile(principal: Principal, docId: String, file: String): ResponseEntity<StreamingResponseBody> {

        val canRead = aclService.getPermissionInfo(principal as Authentication, docId ?: "").canRead
        if(!canRead){
            throw ForbiddenException.withAccessRights("No access to referenced dataset");
        }

        // read file
        val fileStream = StreamingResponseBody { output ->
            try {
                this.storage.read("UserID", docId, file).use { data ->
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
        response.header("Content-Length", storage.getInfo("UserID", docId, file).getSize())
        return ResponseEntity<StreamingResponseBody>(fileStream, HttpStatus.OK);
    }

    override fun deleteFile(principal: Principal, docId: String, file: String): ResponseEntity<StreamingResponseBody> {
        val canWrite = aclService.getPermissionInfo(principal as Authentication, docId ?: "").canWrite
        if(!canWrite){
            throw ForbiddenException.withAccessRights("No access to referenced dataset");
        }

        return ResponseEntity<StreamingResponseBody>(null, HttpStatus.OK);
    }
}
