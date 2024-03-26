package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
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
    ) {

    @Transactional
    fun uploadResourceWithProperties(principal: Authentication, userID: String, collectionId: String, recordId: String, file: MultipartFile, properties: String) {
        // todo: Uploaded files are saved in "_unsaved_" and not in catalog folder.
        //  Only after manually publishing from Editor the file is moved to catalog folder.
        //  If deleting a file from "_unsaved_" it won't be move to "_trash_".

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

        val catalog = catalogService.getCatalogById(collectionId)

        // ------------------------------------------------
        val profile = catalog.type
        // todo: strict check according to profile
        val objectMapper: ObjectMapper = jacksonObjectMapper().registerKotlinModule()
        val downloadURL: ObjectNode = objectMapper.createObjectNode().apply {
            put("uri", resourceId)
            put("value", resourceId)
            put("asLink", false)
        }
        val newResourceInfo: ObjectNode = objectMapper.createObjectNode().apply {
            put("title", resourceId)
            // put("validUntil", "2024-03-27T23:00:00.000Z")
            set<ObjectNode>("downloadURL", downloadURL)
        }
        // ------------------------------------------------

        val document = getDocument(collectionId, recordId)
        val docResourceInfo = getResourceInfo(document.first, null)

        if (docResourceInfo.isArray) (docResourceInfo as ArrayNode).add(newResourceInfo)
        storage.write(collectionId, userID, recordId, resourceId, file.inputStream, fileSize, false)
        documentService.publishDocument(principal, collectionId, document.second, document.first, null)
    }

    @Transactional
    fun deleteResourceWithProperties(principal: Authentication, userID: String, collectionId: String, recordId: String, resourceId: String) {
        if (storage.exists(collectionId, userID, recordId, resourceId)) {
            storage.deleteUnsavedFile(collectionId, userID,  recordId, resourceId)
        } else {
            throw ValidationException.withReason("File does not exist: $resourceId")
        }
        val document = getDocument(collectionId, recordId)
        val docResourceInfo = getResourceInfo(document.first, null)
        val iterator = docResourceInfo.iterator()
        while (iterator.hasNext()) {
            val node = iterator.next()
            val uri = node.get("downloadURL")?.get("uri")?.asText()
            if (uri == resourceId) {
                iterator.remove()
            }
        }
        documentService.updateDocument(principal, collectionId, document.second, document.first)
        documentService.publishDocument(principal, collectionId, document.second, document.first, null)
    }

    fun getResource(collectionId: String, recordId: String, resourceId: String?): JsonNode {
        val document = getDocument(collectionId, recordId)
        return getResourceInfo(document.first, resourceId)
    }

    private fun getDocument(collectionId: String, recordId: String): Pair<Document, Int> {
        apiValidationService.validateCollection(collectionId)
        try {
            val docWrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId, false)
            val document = documentService.getLastPublishedDocument(collectionId, recordId, false, true)
            return Pair(document, docWrapper.id!!)
        } catch (error: Exception) {
            throw NotFoundException.withMissingResource(recordId, "Record")
        }
    }
    private fun getResourceInfo(document: Document, resourceId: String?): JsonNode {
        // todo: get resource information relative to profile - Is it always in 'processSteps[0].considerrationDocs' ?
        val allResources = (document.data.get("processingSteps").get(0) as ObjectNode).get("considerationDocs")
        return if(resourceId.isNullOrEmpty()) {
            allResources as ArrayNode
        } else {
            val resourceInfo = allResources.filter { it.get("downloadURL").get("uri").textValue() == resourceId.toString() }
            resourceInfo[0]
        }
    }

}