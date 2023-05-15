package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostDeletePayload
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PostUploadRemover @Autowired constructor(val storage: Storage) : Filter<PostDeletePayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostDeletePayload, context: Context): PostDeletePayload {
        val docId = payload.document.uuid
        val userId = context.principal?.name

        storage.discardPublished(context.catalogId, docId)
        storage.discardUnpublished(context.catalogId, docId)
        storage.discardUnsaved(context.catalogId, userId, docId)

        return payload
    }

}
