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
 *
 * NOTE Filters are injected using the @Autowired annotation. This means that
 * two Pipe instances with the same Payload type will receive the same filter set.
 */
@Component
class Pipe<T: Payload>(@Value("AnonymousPipe") override val id: String) : ExtensionPoint<Filter<T>> {

    // filterOrderMap={'pipeId1': {'filterA','filterB'}, 'pipeId2': {'filterD','filterC'}}
    @Value("#{\${filterOrderMap:null}}")
    lateinit var filterOrderMap: Map<String, List<String>>

    // filterDisableMap={'pipeId1': {'filterA'}, 'pipeId2': {'filterC'}}
    @Value("#{\${filterDisableMap:null}}")
    lateinit var filterDisableMap: Map<String, List<String>>

    @Autowired
    override lateinit var extensions: List<Filter<T>>

    private val log = logger()

    private lateinit var filters: List<Filter<T>>

    /**
     * Run all registered Filter instances in the configured sequence
     *
     * NOTE Exceptions thrown by a filter must be handled by the client
     * and prevent succeeding filters from running.
     */
    fun runFilters(payload: T, context: Context): T {
        log.debug("Running filters on pipe '$id'")

        // initialize filter list when run first
        if (!::filters.isInitialized) {
            // sort filters
            val hasOrder = filterOrderMap != null && filterOrderMap.containsKey(id) && filterOrderMap[id] != null
            filters = if (hasOrder) {
                val sequence = filterOrderMap[id]
                extensions.sortedBy { sequence!!.indexOf(it.id) }
            }
            else {
                extensions
            }

            // disable filters
            val hasDisabled = filterDisableMap != null && filterDisableMap.containsKey(id) && filterDisableMap[id] != null
            filters = if (hasDisabled) {
                val disabled = filterDisableMap[id]
                filters.filter { it.id !in disabled!! }
            }
            else {
                filters
            }
        }

        // run filters
        var result: T = payload
        for (filter in filters) {
            context.messages.add(Message(this, "Running filter '${filter.id}'"))
            result = filter(result, context)
        }
        return result
    }
}