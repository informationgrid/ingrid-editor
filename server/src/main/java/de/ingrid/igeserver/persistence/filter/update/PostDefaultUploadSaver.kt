package de.ingrid.igeserver.persistence.filter.update

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostUpdatePayload
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PostDefaultUploadSaver @Autowired constructor(val storage: Storage) : Filter<PostUpdatePayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostUpdatePayload, context: Context): PostUpdatePayload {
        val docId = payload.document.uuid

        val files = payload.type.getUploads(payload.document)
        if (context.principal != null) {
            storage.saveDataset(context.catalogId, context.principal?.name, docId, files)
        }
        return payload
    }

}
