package de.ingrid.igeserver.services

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.mdek.upload.storage.Storage
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
@Profile("ogc-resources-api")
class OgcResourceService(
    private val storage: Storage,
) {

    @Transactional
    fun uploadResourceWithProperties(collectionId: String, userID: String, recordId: String, file: MultipartFile, properties: String) {
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

        storage.write(collectionId, userID, recordId, resourceId, file.inputStream, fileSize, false)

        // update Document with Resource properties
    }

    @Transactional
    fun deleteResourceWithProperties(collectionId: String, userID: String, recordId: String, resourceId: String) {
        if (storage.exists(collectionId, userID, recordId, resourceId)) {
            // delete resource
            val fileSystemStorage: FileSystemStorage
            // storage.delete(collectionId, fileSystemStorage)
        } else {
            throw ValidationException.withReason("File does not exist: $resourceId")
        }
        // update Document with Resource properties
    }
}