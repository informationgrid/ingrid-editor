package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter.ISO_LOCAL_DATE

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
    private lateinit var dbService: DBApi

    @Autowired
    private lateinit var dateService: DateService

    @Autowired
    private lateinit var userService: UserManagementService

    @Value("\${audit.log.database:null}")
    private var auditLogDB: String? = null

    /**
     * Log an audit message with the given data
     */
    fun log(category: String, action: String, target: String?, data: JsonNode? = null, logger: String? = null) {
        getLogger(logger).info(createLogMessage(category, action, target, data))
    }

    /**
     * Get audit messages filtered by the given criteria
     */
    fun find(logger: String?, id: String?, user: String?, action: String?, from: LocalDate?, to: LocalDate?,
             sort: String?, sortOrder: String?) : FindAllResults {
        if (auditLogDB.isNullOrEmpty()) {
            throw ConfigurationException("Value 'audit.log.database' is missing or empty.")
        }

        val queryMap = listOfNotNull(
                if (!logger.isNullOrEmpty()) QueryField("logger", logger) else null,
                if (!id.isNullOrEmpty()) QueryField("message.target", id) else null,
                if (!user.isNullOrEmpty()) QueryField("message.actor", user) else null,
                if (!action.isNullOrEmpty()) QueryField("message.action", action) else null,
                if (from != null) QueryField("message.time", " >=", from.format(ISO_LOCAL_DATE)) else null,
                if (to != null) QueryField("message.time", " <=", to.plusDays(1).format(ISO_LOCAL_DATE)) else null
        ).toList()

        dbService.acquire(auditLogDB).use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false,
                    queryOperator = "AND",
                    sortField = sort,
                    sortOrder = sortOrder
            )
            return dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }
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
