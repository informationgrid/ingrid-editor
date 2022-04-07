package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before publish
 */
@Component
class PreDefaultDocumentPublisher : Filter<PrePublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val docId = payload.document.uuid;

        context.addMessage(Message(this, "Process document data '$docId' before publish"))

        // call entity type specific hook
        payload.type.onPublish(payload.document)

        return payload
    }
}
