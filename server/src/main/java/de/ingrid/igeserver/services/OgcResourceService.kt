/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.ogc.resourceHelper.OgcResourceHelperFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.Scope
import net.pwall.json.schema.parser.Parser.Companion.isZero
import org.apache.commons.io.IOUtils
import org.springframework.context.annotation.Profile
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
    private val ogcResourceHelperFactory: OgcResourceHelperFactory
    ) {

    @Transactional
    fun handleUploadResource(principal: Authentication, userID: String, collectionId: String, recordId: String, files: List<MultipartFile>) {
        apiValidationService.validateCollection(collectionId)
        val docWrapper: DocumentWrapper = getDocWrapper(collectionId, recordId)
        val document = getDocument(collectionId, recordId)
        val profile = (catalogService.getCatalogById(collectionId)).type
        val resourceHelper = (ogcResourceHelperFactory.getResourceHelper(profile))[0]

        if (!document.isLatest) throw ValidationException.withReason("Found unpublished Record. Publish record before uploading any resources.")

        files.forEach() { file ->
            // First: Check if all files a listed in document.
            val resourceId = file.originalFilename!!
            val resource = resourceHelper.getResourceDetails(null, document, collectionId, recordId, resourceId)
            val sizeOfResource = resource.size()
            if (sizeOfResource.isZero()) throw ValidationException.withReason("Failed to save resources. Resource '$resourceId' is not part of record. Update record before uploading any resources.")
            if (sizeOfResource > 1) throw ValidationException.withReason("Failed to save resource. Resource '$resourceId' is listed $sizeOfResource times in document.")
        }

        files.forEach() { file ->
            // Second: If all files are listed in document, save files.
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
            throw NotFoundException.withMissingResource(resourceId, "file")
        }
    }

    fun getResource(baseUrl: String, collectionId: String, recordId: String, resourceId: String?, userID: String): JsonNode {
        apiValidationService.validateCollection(collectionId)
        val document = getDocument(collectionId, recordId)
        val profile = (catalogService.getCatalogById(collectionId)).type
        val resourceHelper = (ogcResourceHelperFactory.getResourceHelper(profile))[0]
        val resources = resourceHelper.getResourceDetails(baseUrl, document, collectionId, recordId, resourceId)

        if (resources.size() == 0 && !resourceId.isNullOrEmpty()) {
            // If specific resource with resourceID was not found in DOCUMENT
            throw NotFoundException.withMissingResource(resourceId, "resource/file")
        }

        val missingFiles = resourceHelper.searchForMissingFiles(resources, collectionId, userID, recordId, resourceId)
        if (missingFiles.isNotEmpty()) throw ValidationException.withReason(data = "Following resources are part of document but files are missing: $missingFiles" )

        return resources
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
        objectNode.putArray("item").addAll(arrayNode);
        return objectNode
    }
}