package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.FIELD_ID
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for logging document data send from the client after successfully persisting in the storage
 * NOTE This class uses AuditLogger to create and log messages
 */
@Component
class DataHistoryLogger : Filter<PostPersistencePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()

        const val LOGGER_NAME = "audit.data-history"
        const val LOG_CATEGORY = "data-history"
    }

    @Autowired
    private lateinit var auditLogger: AuditLogger

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PostPersistencePayload, context: Context): PostPersistencePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Log document data '$docId' after persistence"))
        auditLogger.log(
                category = LOG_CATEGORY,
                action = payload.action.name.toLowerCase(),
                target = docId,
                data = null, // TODO: payload.document,
                logger = LOGGER_NAME
        )
        return payload
    }
}