package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.*
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before delete
 */
@Component
class DefaultDocumentRemover : Filter<PreDeletePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreDeletePayload, context: Context): PreDeletePayload {
        val docId = payload.document[FIELD_ID].asText();

        context.addMessage(Message(this, "Process document data '$docId' before delete"))

        // call entity type specific hook
        payload.type.onDelete(payload.document)

        return payload
    }
}