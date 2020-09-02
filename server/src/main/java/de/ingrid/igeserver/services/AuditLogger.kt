package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * AuditLogger writes structured audit messages to a Log4j logger
 */
@Component
class AuditLogger {
    companion object {
        private const val DEFAULT_LOGGER = "audit"

        private const val CATEGORY = "cat"
        private const val ACTION = "action"
        private const val ACTOR = "actor"
        private const val TIME = "time"
        private const val TARGET = "target"
        private const val DATA = "data"
    }

    @Autowired
    private lateinit var dateService: DateService

    @Autowired
    private lateinit var userService: UserManagementService

    /**
     * Log an audit message with the given data
     */
    fun log(category: String, action: String, target: String?, data: JsonNode? = null, logger: String? = null) {
        getLogger(logger).info(createLogMessage(category, action, target, data))
    }

    /**
     * Get the logger with the given name
     */
    private fun getLogger(name: String?): KotlinLogger {
        return if (!name.isNullOrBlank()) logger(name) else logger(DEFAULT_LOGGER)
    }

    /**
     * Create a log message from the given data
     */
    private fun createLogMessage(category: String, action: String, target: String?, data: JsonNode?): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put(CATEGORY, category)
            put(ACTION, action)
            put(ACTOR, userService.getCurrentPrincipal()?.name)
            put(TIME, dateService.now().toString())
            put(TARGET, target)
            replace(DATA, data)
        }
    }
}
