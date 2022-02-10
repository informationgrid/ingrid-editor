package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class DefaultUploadUnpublisher @Autowired constructor(val storage: Storage) : Filter<PostUnpublishPayload> {

    override val profiles = arrayOf("mcloud")

    override fun invoke(payload: PostUnpublishPayload, context: Context): PostUnpublishPayload {
        val docId = payload.document.uuid
        val files = payload.type.getUploads(payload.document)

        storage.unpublishDataset(context.catalogId, docId, files)

        return payload
    }

}
