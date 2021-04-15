package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*

/**
 * Filter for processing document data send from the client before insert
 */
@Component
class DefaultDocumentInitializer : Filter<PreCreatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    @Autowired
    private lateinit var dateService: DateService

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
        // initialize id
        if (payload.document.uuid.isEmpty()) {
            payload.document.uuid = UUID.randomUUID().toString()
        }
        val docId = payload.document.uuid;

        context.addMessage(Message(this, "Process document data '$docId' before insert"))

        initializeDocument(payload, context)
        initializeDocumentWrapper(payload, context)

        // call entity type specific hook
        payload.type.onCreate(payload.document)

        return payload
    }

    protected fun initializeDocument(payload: PreCreatePayload, context: Context) {
        val now = dateService.now()

        with(payload.document) {
            data.put(FIELD_HAS_CHILDREN, false)
            created = now
            modified = now
        }
    }

    protected fun initializeDocumentWrapper(payload: PreCreatePayload, context: Context) {
        val parentId = payload.document.data["_parent"].asText()
        val parentRef = when (parentId) {
            null -> null
            else -> docWrapperRepo.findByUuid(parentId)
        }
        val documentType = "mCloudDoc" // TODO: payload.document.type

        with(payload.wrapper) {
            draft = null
            published = null
            uuid = payload.document.uuid
            parent = parentRef
            type = documentType
            category = payload.category
            archive = mutableSetOf<Document>()
        }
    }
}
