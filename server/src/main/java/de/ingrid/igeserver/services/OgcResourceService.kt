package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.ogc.resourceHandler.OgcResourceHandlerFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.Scope
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.apache.commons.io.IOUtils
import org.springframework.context.annotation.Profile
import org.springframework.core.io.Resource
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.io.IOException

@Service
@Profile("ogc-resources-api")
class OgcResourceService(
    private val storage: Storage,
    private val catalogService: CatalogService,
    private val documentService: DocumentService,
    private val apiValidationService: ApiValidationService,
    private val ogcResourceHandlerFactory: OgcResourceHandlerFactory
    ) {

    @Transactional
    fun handleUploadResource(principal: Authentication, userID: String, collectionId: String, recordId: String, files: List<MultipartFile>) {
        apiValidationService.validateCollection(collectionId)
        val docWrapper: DocumentWrapper = getDocWrapper(collectionId, recordId)
        val document = getDocument(collectionId, recordId)

        files.forEach() { file ->
            val resourceId = file.originalFilename!!
            val fileSize = file.size
            try {
                storage.validate(collectionId, userID, recordId, resourceId, fileSize)
            } catch (ex: Exception) {
                throw ValidationException.withReason(ex.message)
            }
            if (storage.exists(collectionId, userID, recordId, resourceId)) {
                throw ValidationException.withReason("File already exists: $resourceId")
            }
            storage.write(collectionId, userID, recordId, resourceId, file.inputStream, fileSize, false)
        }
        documentService.updateDocument(principal, collectionId, docWrapper.id!!, document)
        documentService.publishDocument(principal, collectionId, docWrapper.id!!, document)
    }

    @Transactional
    fun handleDeleteResource(principal: Authentication, userID: String, collectionId: String, recordId: String, resourceId: String) {
        apiValidationService.validateCollection(collectionId)
        if (storage.exists(collectionId, userID, recordId, resourceId)) {
            val publishedFiles: List<FileSystemItem> = this.storage.list(collectionId, Scope.PUBLISHED)
            val fileSystemItem = publishedFiles.filter() { file -> file.file == resourceId && file.path == recordId}
            storage.delete(collectionId, fileSystemItem[0])
        } else {
            throw ValidationException.withReason("File does not exist: $resourceId")
        }
    }

    fun getResource(baseUrl: String, collectionId: String, recordId: String, resourceId: String?): JsonNode {
        apiValidationService.validateCollection(collectionId)
        val document = getDocument(collectionId, recordId)
        val catalog = catalogService.getCatalogById(collectionId)
        val profile = catalog.type
        val resourceHandler = ogcResourceHandlerFactory.getResourceHandler(profile)
        return resourceHandler[0].getResourceDetails(baseUrl, document, collectionId, recordId, resourceId)
    }

    private fun getDocWrapper(collectionId: String, recordId: String): DocumentWrapper {
        return documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId, false)
    }

    private fun getDocument(collectionId: String, recordId: String): Document {
        try {
            return documentService.getLastPublishedDocument(collectionId, recordId, false, true)
        } catch (error: Exception) {
            throw NotFoundException.withMissingResource(recordId, "Record")
        }
    }


    fun handleResourceDownload(collectionId: String, recordId: String, resourceId: String, userID: String): StreamingResponseBody {
        apiValidationService.validateCollection(collectionId)

        // read file
        val fileStream = StreamingResponseBody { output ->
            try {
                this.storage.read(collectionId, userID, recordId, resourceId).use { data ->
                    IOUtils.copy(data, output)
                    output.flush()
                }
            } catch (ex: IOException) {
                throw NotFoundException.withMissingResource(resourceId, "file")
            }
        }
        return fileStream
    }

    fun prepareForHtmlExport(json: JsonNode): ObjectNode {
        val objectMapper = ObjectMapper()
        val arrayNode = objectMapper.readTree(json.toString()) as ArrayNode
        val objectNode = objectMapper.createObjectNode()
        objectNode.putArray("processingStep").addAll(arrayNode);
        return objectNode
    }
}