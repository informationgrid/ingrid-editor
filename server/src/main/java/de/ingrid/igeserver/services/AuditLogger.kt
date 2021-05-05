package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AuditLogRecord
import de.ingrid.igeserver.repository.AuditLogRepository
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.time.LocalDate

/**
 * AuditLogger writes structured audit messages to a Log4j logger
 */
@Component
class AuditLogger {
    companion object {
        private const val DEFAULT_LOGGER = "audit"

        // used to give appender implementations a hint about the record content
        private const val RECORD_TYPE = "record_type"
        private const val RECORD_TYPE_VALUE = "AuditLog"

        // actual message fields
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
    private lateinit var auditLogRepo: AuditLogRepository

    @Autowired
    private lateinit var userService: UserManagementService

    /**
     * Log an audit message with the given data
     */
    fun log(category: String, action: String, target: String?, data: JsonNode? = null, logger: String? = null) {
        getLogger(logger).info(createLogMessage(category, action, target, data))
    }

    /**
     * Get audit messages filtered by the given criteria
     * NOTE This method only retrieves log messages that are persisted in the database
     */
    fun find(logger: String?, id: String?, user: String?, action: String?, from: LocalDate?, to: LocalDate?,
             sort: String?, sortOrder: String?) : FindAllResults<AuditLogRecord> {
        // TODO: migrate
        /*val queryMap = listOfNotNull(
                if (!logger.isNullOrEmpty()) QueryField("logger", logger) else null,
                if (!id.isNullOrEmpty()) QueryField("message.target", id) else null,
                if (!user.isNullOrEmpty()) QueryField("message.actor", user) else null,
                if (!action.isNullOrEmpty()) QueryField("message.action", action) else null,
                if (from != null) QueryField("message.time", " >=", from.format(ISO_LOCAL_DATE)) else null,
                if (to != null) QueryField("message.time", " <=", to.plusDays(1).format(ISO_LOCAL_DATE)) else null
        ).toList()*/
        
            val result = auditLogRepo.findAll()
            return FindAllResults(result.size.toLong(), result.toList())
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
            put(RECORD_TYPE, RECORD_TYPE_VALUE)
            put(CATEGORY, category)
            put(ACTION, action)
            put(ACTOR, userService.getCurrentPrincipal()?.name)
            put(TIME, dateService.now().toString())
            put(TARGET, target)
            replace(DATA, data)
        }
    }
}
