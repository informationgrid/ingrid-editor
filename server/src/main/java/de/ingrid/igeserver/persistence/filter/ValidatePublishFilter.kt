package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component

/**
 * Filter for validating if the contained payload could be published
 */
@Component
class ValidatePublishFilter : Filter<PersistencePayload> {

    override val id = ValidatePublishFilter::class.toString()

    override fun invoke(payload: PersistencePayload, context: Context): PersistencePayload {
        if (payload.action == PersistencePayload.Action.PUBLISH) {
            context.messages.add(Message(this, "Validate data on publish"))
            // TODO implement validation
        }
        return payload
    }
}