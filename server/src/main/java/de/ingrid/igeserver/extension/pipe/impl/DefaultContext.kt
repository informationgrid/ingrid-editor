package de.ingrid.igeserver.extension.pipe.impl

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.repository.CatalogRepository
import org.apache.logging.log4j.kotlin.logger
import java.security.Principal
import java.util.*

/**
 * Default implementation of a filter context
 */
open class DefaultContext(override val catalogId: String, override val profile: String?, override val principal: Principal?) : Context {

    companion object {
        /**
         * Create an instance with the profile of the currently opened catalog (database)
         */
        fun withCurrentProfile(catalogId: String?, catalogRepo: CatalogRepository, principal: Principal?): DefaultContext {
            val catalogInfo = catalogRepo.findByIdentifier(catalogId!!)
            return DefaultContext(catalogId, catalogInfo.type, principal)
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

class SimpleContext(override val catalogId: String, override val profile: String):  DefaultContext(catalogId, profile, null)
