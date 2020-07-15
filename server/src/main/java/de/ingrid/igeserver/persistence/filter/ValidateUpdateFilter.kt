package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component

/**
 * Filter for validating if the given payload could be inserted to or updated in the storage
 */
@Component
class ValidateUpdateFilter : Filter<PersistencePayload> {

    override val id = ValidateUpdateFilter::class.toString()

    override fun invoke(payload: PersistencePayload, context: Context): PersistencePayload {
        if (payload.action == PersistencePayload.Action.UPDATE) {
            context.messages.add(Message(this, "Validate data on update"))
            // TODO implement validation
        }
        return payload
    }
}