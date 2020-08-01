package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.*
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.*

/**
 * Filter for updating document data send from the client before updating in the storage
 */
@Component
class DefaultDocumentUpdater : Filter<PreUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        context.addMessage(Message(this, "Update document data before update"))

        // update parent in case of moving a document
        val parent = payload.document.get(FIELD_PARENT)
        if (!parent.isNull) {
            payload.wrapper.put(FIELD_PARENT, parent.asText());
        }

        // update modified date
        payload.document.put(FIELD_MODIFIED, OffsetDateTime.now().toString())

        // handle linked docs
        payload.type.handleLinkedFields(payload.document)

        return payload
    }
}