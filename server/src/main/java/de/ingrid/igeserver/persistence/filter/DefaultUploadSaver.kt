package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class DefaultUploadSaver : Filter<PostUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    @Autowired
    private lateinit var documentRepo: DocumentRepository

    @Autowired
    private lateinit var storage: Storage

    override fun invoke(payload: PostUpdatePayload, context: Context): PostUpdatePayload {
        val docId = payload.document.uuid

        val files = payload.type.getUploads(payload.document)
        if(context.principal != null) {
            storage.saveDataset(context.catalogId, context.principal?.name, docId, files)
        }
        return payload
    }

}
