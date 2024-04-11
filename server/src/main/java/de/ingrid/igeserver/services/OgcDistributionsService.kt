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

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.ogc.distributionHelper.OgcDistributionHelperFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.Scope
import net.pwall.json.schema.parser.Parser.Companion.isZero
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
@Profile("ogc-distributions-api")
class OgcDistributionsService(
    private val storage: Storage,
    private val catalogService: CatalogService,
    private val documentService: DocumentService,
    private val apiValidationService: ApiValidationService,
    private val ogcDistributionHelperFactory: OgcDistributionHelperFactory
    ) {

    @Transactional
    fun handleUploadDistribution(principal: Authentication, userID: String, collectionId: String, recordId: String, files: List<MultipartFile>) {
        apiValidationService.validateCollection(collectionId)
        val docWrapper: DocumentWrapper = getDocWrapper(collectionId, recordId)
        val document = getDocument(collectionId, recordId)
        val profile = (catalogService.getCatalogById(collectionId)).type
        val distributionHelper = (ogcDistributionHelperFactory.getDistributionHelper(profile))[0]

        if (!document.isLatest) throw ValidationException.withReason("Found unpublished Record. Publish record before uploading any distributions.")

        files.forEach() { file ->
            // First: Check if all files a listed in document.
            val distributionId = file.originalFilename!!
            val distribution = distributionHelper.getDistributionDetails(document, collectionId, recordId, distributionId)
            val sizeOfDistribution = distribution.size()
            if (sizeOfDistribution.isZero()) throw ValidationException.withReason("Failed to save distributions. Distribution '$distributionId' is not part of record. Update record before uploading any distributions.")
            if (sizeOfDistribution > 1) throw ValidationException.withReason("Failed to save distribution. Distribution '$distributionId' is listed $sizeOfDistribution times in document.")
        }

        files.forEach() { file ->
            // Second: If all files are listed in document, save files.
            val distributionId = file.originalFilename!!
            val fileSize = file.size
            try {
                storage.validate(collectionId, userID, recordId, distributionId, fileSize)
            } catch (ex: Exception) {
                throw ValidationException.withReason(ex.message)
            }
            if (storage.exists(collectionId, userID, recordId, distributionId)) {
                throw ValidationException.withReason("File already exists: $distributionId")
            }
            storage.write(collectionId, userID, recordId, distributionId, file.inputStream, fileSize, false)
        }

        documentService.updateDocument(principal, collectionId, docWrapper.id!!, document)
        documentService.publishDocument(principal, collectionId, docWrapper.id!!, document)
    }

    @Transactional
    fun handleDeleteDistribution(principal: Authentication, userID: String, collectionId: String, recordId: String, distributionId: String) {
        apiValidationService.validateCollection(collectionId)
        if (storage.exists(collectionId, userID, recordId, distributionId)) {
            val publishedFiles: List<FileSystemItem> = this.storage.list(collectionId, Scope.PUBLISHED)
            val fileSystemItem = publishedFiles.filter() { file -> file.file == distributionId && file.path == recordId}
            storage.delete(collectionId, fileSystemItem[0])
        } else {
            throw NotFoundException.withMissingResource(distributionId, "file")
        }
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