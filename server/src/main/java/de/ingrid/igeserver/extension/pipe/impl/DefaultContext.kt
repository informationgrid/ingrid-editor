package de.ingrid.igeserver.extension.pipe.impl

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Message
import java.util.*

/**
 * Default implementation of a filter context
 */
open class DefaultContext : Context {

    override var messages: Queue<Message> = LinkedList<Message>()

    override var properties: Map<String, Any?> = mutableMapOf()
}