package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for logging document data send from the client after persisting in the storage
 */
@Component
class DataHistoryLogger : Filter<PostPersistencePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()

        private const val ACTION = "action"
        private const val ACTOR = "actor"
        private const val DATA = "data"
    }

    @Autowired
    private lateinit var userService: UserManagementService

    private val log = logger()

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PostPersistencePayload, context: Context): PostPersistencePayload {
        context.addMessage(Message(this, "Log document data after persistence"))
        log.info(createLogMessage(payload))

        return payload
    }

    private fun createLogMessage(payload: PostPersistencePayload): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put(ACTION, payload.action.name.toLowerCase())
            put(ACTOR, userService.getCurrentPrincipal()?.name)
            replace(DATA, payload.document)
        }
    }
}