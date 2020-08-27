package de.ingrid.igeserver.persistence.orientdb

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal
import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.db.ODatabaseType
import com.orientechnologies.orient.core.db.OrientDB
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.PersistenceException
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
import org.springframework.stereotype.Component

/**
 * Log4j2 appender using the orientdb database connected by the @Autowired OrientDBDatabase instance
 *
 * Configuration example:
 * <OrientDBAppender name="DataHistoryDB" database="DataHistory" table="log" />
 *
 * NOTE In order to connect to the embedded server, we need to use the existing database context created by OrientDBDatabase
 * because an exception is thrown otherwise (java.lang.IllegalStateException: File is allowed to be opened only once.).
 * To achieve this, we let Log4j create an appender instance via the @Plugin annotation and Spring another instance via the
 * @Component annotation. The  second instance gets the OrientDBDatabase instance injected into a static member, that can
 * then be used by all other instances - especially the first instance actually used by Log4j.
 */
@Component
@Plugin(name = "OrientDBAppender", category = Core.CATEGORY_NAME, elementType = Appender.ELEMENT_TYPE)
class OrientDBLog4JAppender(@Value("OrientDB") name: String?, filter: Filter?,
                            val database: String?,
                            val table: String?) :
        AbstractAppender(name, filter, null, false, null) {

    companion object {
        private const val LOGGER = "logger"
        private const val TIMESTAMP = "timestamp"
        private const val LEVEL = "level"
        private const val THREAD = "thread"
        private const val MESSAGE = "message"

        private const val CLASS = "class"
        private const val FILE = "file"
        private const val METHOD = "method"
        private const val LINE = "line"

        private const val MAX_QUEUE_LENGTH = 1

        // shared orientDB instance
        private lateinit var orientDB: OrientDB

        @PluginFactory
        @JvmStatic
        fun createAppender(
                @PluginAttribute("name") name: String?,
                @PluginAttribute("database") database: String?,
                @PluginAttribute("table") table: String?,
                @PluginElement("Filter") filter: Filter?): OrientDBLog4JAppender {
            if (database.isNullOrEmpty()) {
                error("Configuration attribute 'database' must be a valid database name")
            }
            if (table.isNullOrEmpty()) {
                error("Configuration attribute 'table' must be a valid table name")
            }
            return OrientDBLog4JAppender(name, filter, database, table)
        }
    }

    private var queue = mutableListOf<JsonNode>()

    private val log = logger()

    @Autowired
    fun setDBApi(orientDBDatabase: OrientDBDatabase) {
        log.debug("Initializing OrientDBLog4JAppender using OrientDBDatabase instance")

        orientDB = orientDBDatabase.orientDB
        if (!orientDB.isOpen) {
            throw PersistenceException("Failed to initialize OrientDBLog4JAppender. OrientDBDatabase is not initialized.")
        }

        try {
            executeStateSafe {
                // create databases for all appender instances
                val factory: LoggerContextFactory = LogManager.getFactory()
                val selector: ContextSelector = (factory as Log4jContextFactory).selector
                selector.loggerContexts.onEach { ctx ->
                    ctx.configuration.appenders.values.onEach { a ->
                        if (a is OrientDBLog4JAppender) {
                            val isNew = orientDB.createIfNotExists(a.database, ODatabaseType.PLOCAL)
                            if (isNew) {
                                orientDB.open(a.database, OrientDBDatabase.serverUser, OrientDBDatabase.serverPassword).use {
                                    initializeSchema(it as ODatabaseSession, a.table!!)
                                }
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            throw PersistenceException("Failed to initialize OrientDBLog4JAppender", e)
        }
    }

    override fun stop() {
        saveQueue()
    }

    override fun append(event: LogEvent) {
        val item: JsonNode = mapEvent(event)
        queue.add(item)
        if (queue.size >= MAX_QUEUE_LENGTH) {
            saveQueue()
        }
    }

    private fun mapEvent(event: LogEvent): JsonNode {
        // create message node
        var msg: JsonNode = try {
            jacksonObjectMapper().readTree(event.message.formattedMessage)
        }
        catch(ex: Exception) {
            // message is no valid json
            jacksonObjectMapper().createObjectNode().apply {
                put("text", event.message.formattedMessage)
            }
        }
        (msg as ObjectNode).put("@type", "d")

        return jacksonObjectMapper().createObjectNode().apply {
            put(LOGGER, event.loggerName)
            put(TIMESTAMP, event.timeMillis)
            put(LEVEL, event.level?.name())
            put(THREAD, event.threadName)
            put(FILE, event.source?.fileName)
            put(CLASS, event.source?.className)
            put(METHOD, event.source?.methodName)
            put(LINE, event.source?.lineNumber)
            replace(MESSAGE, msg)
        }
    }

    /**
     * Save all queued log events and empty the queue afterwards
     */
    private fun saveQueue() {
        if (queue.size == 0) return

        try {
            executeStateSafe {
                orientDB.open(database, OrientDBDatabase.serverUser, OrientDBDatabase.serverPassword).use {
                    val session = it as ODatabaseSession
                    val cmd = StringBuffer("BEGIN;\n")
                    for (obj in queue) {
                        cmd.append("INSERT INTO $table CONTENT $obj;\n")
                    }
                    cmd.append("COMMIT;")
                    session.execute("sql", cmd.toString())
                }
            }
        }
        catch (e: Exception) {
            error("Unexpected exception while saving log events", null, e)
        }
        queue.clear()
    }

    /**
     * Initialize the schema for log events
     */
    private fun initializeSchema(session: ODatabaseSession, table: String) {
        val schema = session.metadata.schema
        if (!schema.existsClass(table)) {
            val logClass = schema.createClass(table)
            logClass.createProperty(LOGGER, OType.STRING)
            logClass.createProperty(TIMESTAMP, OType.STRING)
            logClass.createProperty(LEVEL, OType.STRING)
            logClass.createProperty(THREAD, OType.STRING)
            logClass.createProperty(MESSAGE, OType.EMBEDDEDMAP)
            logClass.createProperty(CLASS, OType.STRING)
            logClass.createProperty(FILE, OType.STRING)
            logClass.createProperty(METHOD, OType.STRING)
            logClass.createProperty(LINE, OType.INTEGER)
        }
    }

    /**
     * Execute the given function and set back the current thread local database afterwards
     */
    private fun executeStateSafe(f: () -> Unit) {
        // save state
        val threadLocalInst = ODatabaseRecordThreadLocal.instance()
        val curDb = if (threadLocalInst.isDefined) threadLocalInst.get() else null

        f()

        // restore state
        if (curDb != null) {
            threadLocalInst.set(curDb)
        }
    }
}