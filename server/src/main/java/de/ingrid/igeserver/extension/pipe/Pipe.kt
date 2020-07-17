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

    /**
     * Optional configuration value for defining the filter sequences
     * Map keys are pipe ids and values are arrays of filter ids defining the sequence for this pipe
     *
     * Example (application.properties):
     * pipes.filter.order={'pipeId1': {'filterA','filterB'}, 'pipeId2': {'filterD','filterC'}}
     */
    @Value("#{\${pipes.filter.order:null}}")
    var filterOrderMap: Map<String, List<String>>? = null

    /**
     * Optional configuration value for defining disabled filters
     * Map keys are pipe ids and values are arrays of filter ids to be disabled in this pipe
     *
     * Example (application.properties):
     * pipes.filter.disabled={'pipeId1': {'filterA'}, 'pipeId2': {'filterC'}}
     */
    @Value("#{\${pipes.filter.disabled:null}}")
    var filterDisableMap: Map<String, List<String>>? = null

    /**
     * List of all filters contained in this pipe as received from the configuration
     */
    @Autowired
    override lateinit var extensions: List<Filter<T>>

    /**
     * Sorted list of enabled filters contained in this pipe
     */
    private lateinit var filters: List<Filter<T>>

    private val log = logger()

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
            val filterSequence: List<String>? = filterOrderMap?.getOrDefault(id, emptyList())
            filters = extensions.sortedBy { filterSequence?.indexOf(it.id) }

            // disable filters
            val disabledFilters: List<String>? = filterDisableMap?.getOrDefault(id, emptyList())
            filters = filters.filter { disabledFilters == null || !disabledFilters.contains(it.id) }
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