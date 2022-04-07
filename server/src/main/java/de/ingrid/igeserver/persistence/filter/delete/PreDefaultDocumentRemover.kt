package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreDeletePayload
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before delete
 */
@Component
class PreDefaultDocumentRemover : Filter<PreDeletePayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreDeletePayload, context: Context): PreDeletePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before delete"))

        // call entity type specific hook
        payload.type.onDelete(payload.document)

        return payload
    }
}