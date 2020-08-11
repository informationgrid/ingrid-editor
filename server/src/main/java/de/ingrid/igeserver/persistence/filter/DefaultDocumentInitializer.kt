package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.*
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.*

/**
 * Filter for initializing document data send from the client before inserting into the storage
 */
@Component
class DefaultDocumentInitializer : Filter<PreCreatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
        context.addMessage(Message(this, "Initialize document data before insert"))

        initializeDocument(payload, context)
        initializeDocumentWrapper(payload, context)

        return payload
    }

    protected fun initializeDocument(payload: PreCreatePayload, context: Context) {
        val uuid = payload.document.get(FIELD_ID)?.textValue() ?: UUID.randomUUID().toString()
        val now = OffsetDateTime.now().toString()

        with(payload.document) {
            put(FIELD_ID, uuid)
            put(FIELD_HAS_CHILDREN, false)
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