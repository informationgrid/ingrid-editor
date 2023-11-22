package de.ingrid.igeserver.extension.pipe.impl

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import java.security.Principal
import java.util.*

/**
 * Default implementation of a filter context
 */
open class DefaultContext(
    override val catalogId: String, 
    override val profile: String,
    override val parentProfile: String?, 
    override val principal: Principal?
) : Context {

    companion object {
        /**
         * Create an instance with the profile of the currently opened catalog (database)
         */
        fun withCurrentProfile(
            catalogId: String,
            catalogService: CatalogService,
            principal: Principal?
        ): DefaultContext {
            val profile = catalogService.getProfileFromCatalog(catalogId)
            return DefaultContext(catalogId, profile.identifier, profile.parentProfile, principal)
        }
    }

    private val messages: Queue<Message> = LinkedList()
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

class SimpleContext(override val catalogId: String, override val profile: String, val uuid: String) :
    DefaultContext(catalogId, profile, null, null)
