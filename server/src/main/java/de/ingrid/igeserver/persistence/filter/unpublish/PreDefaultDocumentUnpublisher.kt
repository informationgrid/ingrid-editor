package de.ingrid.igeserver.persistence.filter.unpublish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreUnpublishPayload
import org.springframework.stereotype.Component

/**
 * Filter for validating if a document can be unpublished.
 */
@Component
class PreDefaultDocumentUnpublisher : Filter<PreUnpublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreUnpublishPayload, context: Context): PreUnpublishPayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before unpublishing."))

        // call entity type specific hook
        payload.type.onUnpublish(payload.document)

        return payload
    }
}