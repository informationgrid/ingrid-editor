package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before publish
 */
@Component
class DefaultDocumentPublisher : Filter<PrePublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val docId = payload.document.uuid;

        context.addMessage(Message(this, "Process document data '$docId' before publish"))

        // call entity type specific hook
        payload.type.onPublish(payload.document)

        return payload
    }
}