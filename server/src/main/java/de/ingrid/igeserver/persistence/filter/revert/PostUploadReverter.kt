package de.ingrid.igeserver.persistence.filter.revert

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostRevertPayload
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PostUploadReverter @Autowired constructor(
    val storage: Storage
) :
    Filter<PostRevertPayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostRevertPayload, context: Context): PostRevertPayload {
        val docId = payload.document.uuid

        storage.discardUnpublished(context.catalogId, docId)

        return payload
    }

}
