package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
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

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
        // initialize id
        if (payload.document.get(FIELD_ID)?.textValue().isNullOrEmpty()) {
            payload.document.put(FIELD_ID, UUID.randomUUID().toString())
        }
        val docId = payload.document[FIELD_ID].asText();

        context.addMessage(Message(this, "Process document data '$docId' before insert"))

        initializeDocument(payload, context)
        initializeDocumentWrapper(payload, context)

        // call entity type specific hook
        payload.type.onCreate(payload.document)

        return payload
    }

    protected fun initializeDocument(payload: PreCreatePayload, context: Context) {
        val now = dateService.now().toString()

        with(payload.document) {
            put(FIELD_HAS_CHILDREN, false) // TODO: is this field necessary?
            put(FIELD_CREATED, now)
            put(FIELD_MODIFIED, now)
        }
    }

    protected fun initializeDocumentWrapper(payload: PreCreatePayload, context: Context) {
        val parentId = payload.document[PARENT_ID]?.textValue()
        val documentType = payload.document[FIELD_DOCUMENT_TYPE].asText()

        with(payload.wrapper) {
            put(FIELD_DRAFT, null as String?)
            put(FIELD_PUBLISHED, null as String?)
            put(FIELD_ID, payload.document[FIELD_ID].asText())
            put(FIELD_PARENT, parentId)
            put(FIELD_DOCUMENT_TYPE, documentType)
            put(FIELD_CATEGORY, payload.category)
            putArray(FIELD_ARCHIVE)
        }
    }
}
