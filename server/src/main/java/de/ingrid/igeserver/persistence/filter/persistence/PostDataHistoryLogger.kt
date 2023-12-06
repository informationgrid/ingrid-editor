package de.ingrid.igeserver.persistence.filter.persistence

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPersistencePayload
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Filter for logging document data send from the client after successfully persisting in the storage
 * NOTE This class uses AuditLogger to create and log messages
 */
@Component
class PostDataHistoryLogger(
    var auditLogger: AuditLogger,
    @Lazy var documentService: DocumentService
) : Filter<PostPersistencePayload> {

    companion object {
        const val LOGGER_NAME = "audit.data-history"
        const val LOG_CATEGORY = "data-history"
    }

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostPersistencePayload, context: Context): PostPersistencePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Log document data '$docId' after persistence"))
        auditLogger.log(
            category = LOG_CATEGORY,
            action = payload.action.name.lowercase(),
            target = docId,
            data = documentService.convertToJsonNode(payload.document),
            logger = LOGGER_NAME,
            catalogIdentifier = payload.catalogIdentifier
        )
        return payload
    }
}
