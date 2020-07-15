package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.extension.ExtensionPoint
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * Extension point implementing the pipes and filters pattern
 *
 * Extensions are Filter instances that are executed in the registered sequence.
 */
@Component
class Pipe<T: Payload>(@Value("AnonymousPipe") override val id: String) : ExtensionPoint<Filter<T>> {

    @Autowired
    override lateinit var extensions: List<Filter<T>>

    private val log = logger()

    /**
     * Run all registered Filter instances in the configured sequence
     *
     * NOTE Exceptions thrown by a filter must be handled by the client
     * and prevent succeeding filters from running.
     */
    fun runFilters(payload: T, context: Context): T {
        log.debug("Running filters on pipe '$id'")
        var result: T = payload
        for (filter in extensions) {
            context.messages.add(Message(this, "Running filter '${filter.id}'"))
            result = filter(result, context)
        }
        return result
    }
}