package de.ingrid.igeserver.extension.pipe.impl

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import org.apache.logging.log4j.kotlin.logger
import java.util.*

/**
 * Default implementation of a filter context
 */
open class DefaultContext(override val profile: String?) : Context {

    companion object {
        /**
         * Create an instance with the profile of the currently opened catalog (database)
         */
        fun withCurrentProfile(dbService: DBApi): DefaultContext {
            val catalogInfoList = dbService.findAll(CatalogInfoType::class)
            val profile: String? = if (catalogInfoList.isNotEmpty()) catalogInfoList[0]["type"]?.asText() else null
            return DefaultContext(profile)
        }
    }

    private val messages: Queue<Message> = LinkedList<Message>()
    private val log = logger()

    override fun addMessage(msg: Message) {
        log.debug(msg)
        messages.add(msg)
    }

    override fun clearMessages() {
        messages.clear()
    }

    override fun messages(): Iterable<Message> {
        return messages.asIterable()
    }

    override var properties: Map<String, Any?> = mutableMapOf()
}