package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataTypeRegistry
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.core.Appender
import org.apache.logging.log4j.core.Core
import org.apache.logging.log4j.core.Filter
import org.apache.logging.log4j.core.LogEvent
import org.apache.logging.log4j.core.appender.AbstractAppender
import org.apache.logging.log4j.core.config.plugins.Plugin
import org.apache.logging.log4j.core.config.plugins.PluginAttribute
import org.apache.logging.log4j.core.config.plugins.PluginElement
import org.apache.logging.log4j.core.config.plugins.PluginFactory
import org.apache.logging.log4j.core.impl.Log4jContextFactory
import org.apache.logging.log4j.core.selector.ContextSelector
import org.apache.logging.log4j.kotlin.logger
import org.apache.logging.log4j.spi.LoggerContextFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.jdbc.core.namedparam.SqlParameterSource
import org.springframework.stereotype.Component
import java.sql.Types
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import javax.transaction.Transactional

/**
 * Log4j2 appender using the postgresql database configured in application.properties (spring.datasource)
 *
 * Configuration example:
 * <PostgreSQLAppender name="DataHistoryDB" table="log" />
 *
 * NOTE In order to connect to the database server, we use a JdbcTemplate instance injected into the instance managed by Log4j.
 * To achieve this, we let Log4j create an appender instance via the @Plugin annotation and Spring another instance via the
 * @Component annotation. The  second instance gets the JdbcTemplate instance injected into a static member, that can
 * then be used by all other instances - especially the first instance actually used by Log4j.
 */
@Component
@Plugin(name = "PostgreSQLAppender", category = Core.CATEGORY_NAME, elementType = Appender.ELEMENT_TYPE)
class PostgreSQLLog4JAppender(@Value("PostgreSQL") name: String?, filter: Filter?,
                              var table: String?) :
        AbstractAppender(name, filter, null, false, null) {

    companion object {
        // type column name used ot define the EmbeddedData type in the database
        private const val TYPE = "type"

        // default record fields (the message field contains the EmbeddedData, if any)
        private const val LOGGER = "logger"
        private const val TIMESTAMP = "timestamp"
        private const val LEVEL = "level"
        private const val THREAD = "thread"
        private const val MESSAGE = "message"

        private const val CLASS = "class"
        private const val FILE = "file"
        private const val METHOD = "method"
        private const val LINE = "line"

        // record field used to give appender implementations a hint about the EmbeddedData type
        // that defines the message content
        private const val RECORD_TYPE = "record_type"

        private const val MAX_QUEUE_LENGTH = 1

        // shared JdbcTemplate instance
        private lateinit var jdbcTemplate: NamedParameterJdbcTemplate
        // shared EmbeddedDataTypeRegistry for getting the type column value
        // used to define the EmbeddedData type of a log record
        private lateinit var embeddedDataTypes: EmbeddedDataTypeRegistry

        private const val TABLE_NAME_VAR = "{TABLE_NAME}"
        private const val CREATE_TABLE_STMT = """
            CREATE TABLE IF NOT EXISTS $TABLE_NAME_VAR (
              id              serial PRIMARY KEY,
              type            varchar(255) NOT NULL,
              $MESSAGE        jsonb,
              $FILE           varchar(255),
              $CLASS          varchar(255),
              $METHOD         varchar(255),
              $LINE           varchar(255),
              $LOGGER         varchar(255),
              $THREAD         varchar(255),
              $LEVEL          varchar(255),
              $TIMESTAMP      timestamptz NOT NULL DEFAULT NOW()
            );
        """
        private const val INSERT_RECORD_STMT = """
            INSERT INTO $TABLE_NAME_VAR 
                ($TYPE, $MESSAGE, $FILE, $CLASS, $METHOD, $LINE, $LOGGER, $THREAD, $LEVEL, $TIMESTAMP)
            VALUES 
                (:$TYPE, to_json(:$MESSAGE), :$FILE, :$CLASS, :$METHOD, :$LINE, :$LOGGER, :$THREAD, :$LEVEL, :$TIMESTAMP);
        """

        /**
         * This method is called during Log4j initialization
         */
        @PluginFactory
        @JvmStatic
        fun createAppender(
                @PluginAttribute("name") name: String?,
                @PluginAttribute("table") table: String?,
                @PluginElement("Filter") filter: Filter?): PostgreSQLLog4JAppender {
            if (table.isNullOrEmpty()) {
                error("Configuration attribute 'table' must be a valid table name")
            }
            return PostgreSQLLog4JAppender(name, filter, table)
        }

        private fun checkInitialized(): Boolean {
            return !(!::jdbcTemplate.isInitialized || !::embeddedDataTypes.isInitialized)
        }
    }

    private val queue = mutableListOf<SqlParameterSource>()

    private val mapper = jacksonObjectMapper()

    private val log = logger()

    /**
     * This method is called during Spring initialization
     * NOTE When this method is called, the Spring environment is initialized, which means that jdbcTemplate
     * can be used to initialize the database tables
     */
    @Autowired
    fun setJdbcTemplate(jdbcTemplate: NamedParameterJdbcTemplate) {
        log.debug("Initializing PostgreSQLLog4JAppender using JdbcTemplate instance")

        PostgreSQLLog4JAppender.jdbcTemplate = jdbcTemplate

        try {
            // create tables for all appender instances
            val factory: LoggerContextFactory = LogManager.getFactory()
            val selector: ContextSelector = (factory as Log4jContextFactory).selector
            selector.loggerContexts.onEach { ctx ->
                ctx.configuration.appenders.values.onEach { a ->
                    if (a is PostgreSQLLog4JAppender) {
                        log.debug("Initializing schema: table=${a.table}")
                        a.table?.let {
                            jdbcTemplate.jdbcOperations.execute(CREATE_TABLE_STMT.replace(TABLE_NAME_VAR, it))
                        }
                    }
                }
            }
        }
        catch (e: Exception) {
            throw PersistenceException.withReason("Failed to initialize PostgreSQLLog4JAppender.", e)
        }
    }

    @Autowired
    fun setEmbeddedDataTypeRegistry(embeddedDataTypes: EmbeddedDataTypeRegistry) {
        PostgreSQLLog4JAppender.embeddedDataTypes = embeddedDataTypes
    }

    override fun stop() {
        if (checkInitialized()) {
            saveQueue()
        }
    }

    override fun append(event: LogEvent) {
        if (checkInitialized()) {
            val item = mapEvent(event)
            queue.add(item)
            if (queue.size >= MAX_QUEUE_LENGTH) {
                saveQueue()
            }
        }
        else {
            log.warn("PostgreSQLLog4JAppender is not initialized properly. Ignoring log requests.")
        }
    }

    private fun mapEvent(event: LogEvent): SqlParameterSource {
        // create message node
        val msg: JsonNode = try {
            mapper.readTree(event.message.formattedMessage)
        }
        catch (ex: Exception) {
            // message is no valid json
            mapper.createObjectNode().apply {
                put("text", event.message.formattedMessage)
            }
        }

        // check if the message contains a record type hint and fall back to EmbeddedMap, if not
        val dataType = embeddedDataTypes.getType(msg.get(RECORD_TYPE).textValue())

        // see https://jdbc.postgresql.org/documentation/head/8-date-time.html
        val localDate = Instant.ofEpochMilli(event.timeMillis).atZone(ZoneId.systemDefault())
        val utcDate = localDate.withZoneSameInstant(ZoneOffset.UTC).toOffsetDateTime()
        return MapSqlParameterSource()
            .addValue(TYPE, dataType.typeColumnValue, Types.VARCHAR)
            .addValue(LOGGER, event.loggerName, Types.VARCHAR)
            .addValue(TIMESTAMP, utcDate, Types.TIMESTAMP_WITH_TIMEZONE)
            .addValue(LEVEL, event.level?.name(), Types.VARCHAR)
            .addValue(THREAD, event.threadName, Types.VARCHAR)
            .addValue(FILE, event.source?.fileName, Types.VARCHAR)
            .addValue(CLASS, event.source?.className, Types.VARCHAR)
            .addValue(METHOD, event.source?.methodName, Types.VARCHAR)
            .addValue(LINE, event.source?.lineNumber, Types.VARCHAR)
            .addValue(MESSAGE, mapper.writeValueAsString(msg), Types.VARCHAR)
    }

    /**
     * Save all queued log events and empty the queue afterwards
     */
    @Transactional
    private fun saveQueue() {
        if (queue.size == 0) return

        try {
            val parameters = queue.toTypedArray()
            val count = table?.let {
                jdbcTemplate.batchUpdate(INSERT_RECORD_STMT.replace(TABLE_NAME_VAR, it), parameters)
            }
            log.debug("Inserted ${count?.sum()} records in to log table '$table'.")
        }
        catch (e: Exception) {
            error("Unexpected exception while saving log events", null, e)
        }
        queue.clear()
    }
}