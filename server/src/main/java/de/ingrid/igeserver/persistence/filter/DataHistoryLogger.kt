package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.FIELD_ID
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * Filter for logging document data send from the client after successfully persisting in the storage
 * NOTE This class uses AuditLogger to create and log messages
 */
@Component
class DataHistoryLogger(
        /**
         * Log4j logger name to be used for data history logging
         */
        @Value("\${audit.log.data-history-logger:audit.data-history}") val loggerName: String,

        /**
         * Audit log category used for data history logging
         */
        @Value("\${audit.log.data-history-category:data-history}") val logCategory: String
    ) : Filter<PostPersistencePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    @Autowired
    private lateinit var auditLogger: AuditLogger

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PostPersistencePayload, context: Context): PostPersistencePayload {
        val docId = payload.document[FIELD_ID].asText()

        context.addMessage(Message(this, "Log document data '$docId' after persistence"))
        auditLogger.log(
                category = logCategory,
                action = payload.action.name.toLowerCase(),
                target = docId,
                data = payload.document,
                logger = loggerName
        )
        return payload
    }
}