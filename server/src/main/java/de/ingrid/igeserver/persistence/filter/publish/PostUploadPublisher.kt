package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PostUploadPublisher @Autowired constructor(val storage: Storage) : Filter<PostPublishPayload> {

    override val profiles = arrayOf("mcloud", "uvp")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {
        val docId = payload.document.uuid

        val files = payload.type.getUploads(payload.document)
        storage.publishDataset(context.catalogId, docId, files)

        return payload
    }

}
