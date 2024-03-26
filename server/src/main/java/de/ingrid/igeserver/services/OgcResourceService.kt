package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.ogc.resourceHandler.OgcResourceHandlerFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

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
    fun uploadResourceWithProperties(principal: Authentication, userID: String, collectionId: String, recordId: String, file: MultipartFile, properties: String) {
        apiValidationService.validateCollection(collectionId)

        val resourceId = file.originalFilename
        val fileSize = file.size

        try {
            storage.validate(collectionId, userID, recordId, resourceId, fileSize)
        } catch (ex: Exception) {
            throw ValidationException.withReason(ex.message)
        }

        if (storage.exists(collectionId, userID, recordId, resourceId)) {
            throw ValidationException.withReason("File already exists: $resourceId")
        }

        val docWrapperId = (getDocWrapper(collectionId, recordId)).id!!
        val document = getDocument(collectionId, recordId)

        val catalog = catalogService.getCatalogById(collectionId)
        val profile = catalog.type
        val resourceHandler = ogcResourceHandlerFactory.getResourceHandler(profile)
        val updatedDoc = resourceHandler[0].addResource(document, resourceId, properties)

        storage.write(collectionId, userID, recordId, resourceId, file.inputStream, fileSize, false)
        documentService.publishDocument(principal, collectionId, docWrapperId, updatedDoc, null)
    }

    @Transactional
    fun deleteResourceWithProperties(principal: Authentication, userID: String, collectionId: String, recordId: String, resourceId: String) {
        apiValidationService.validateCollection(collectionId)
        if (storage.exists(collectionId, userID, recordId, resourceId)) {
            storage.deleteUnsavedFile(collectionId, userID,  recordId, resourceId)
        } else {
            throw ValidationException.withReason("File does not exist: $resourceId")
        }
        val document = getDocument(collectionId, recordId)

        val catalog = catalogService.getCatalogById(collectionId)
        val profile = catalog.type
        val resourceHandler = ogcResourceHandlerFactory.getResourceHandler(profile)
        val updatedDoc = resourceHandler[0].deleteResource(document, resourceId)

        val docWrapperId = (getDocWrapper(collectionId, recordId)).id!!
        documentService.publishDocument(principal, collectionId, docWrapperId, updatedDoc, null)
    }

    fun getResource(collectionId: String, recordId: String, resourceId: String?): JsonNode {
        apiValidationService.validateCollection(collectionId)
        val document = getDocument(collectionId, recordId)
        val catalog = catalogService.getCatalogById(collectionId)
        val profile = catalog.type
        val resourceHandler = ogcResourceHandlerFactory.getResourceHandler(profile)
        return resourceHandler[0].getResourceDetails(document, resourceId)
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

}