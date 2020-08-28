package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for updating document data send from the client before updating in the storage
 */
@Component
class DefaultDocumentUpdater : Filter<PreUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    @Autowired
    private lateinit var dateService: DateService

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
        payload.document.put(FIELD_MODIFIED, dateService.now().toString())

        // handle linked docs
        payload.type.handleLinkedFields(payload.document)

        return payload
    }
}