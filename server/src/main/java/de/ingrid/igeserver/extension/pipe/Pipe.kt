/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.extension.ExtensionPoint
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value

/**
 * Extension point implementing the pipes and filters pattern
 *
 * Extensions are Filter instances that are executed in the registered sequence.
 *
 * NOTE Filters are injected using the @Autowired annotation. This means that
 * two Pipe instances with the same Payload type will receive the same filter set.
 */
open class Pipe<T: Payload>(@Value("AnonymousPipe") override val id: String) : ExtensionPoint<Filter<T>> {
    
    private val log = logger()

    /**
     * Optional configuration value for defining the filter sequences
     * Map keys are pipe ids and values are arrays of filter ids defining the sequence for this pipe
     * NOTE Filters with ids that are not contained in the array will be put at the end
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
    @Autowired(required = false)
    override lateinit var extensions: List<Filter<T>>

    /**
     * Sorted list of enabled filters contained in this pipe
     */
    private val filters: List<Filter<T>> by lazy {
        // sort filters
        val filterSequence: List<String>? = filterOrderMap?.getOrDefault(id, emptyList())
        val sortedFilters = extensions.sortedBy {
            if (filterSequence != null && filterSequence.contains(it.id)) {
                filterSequence.indexOf(it.id)
            }
            else  {
                // put unknown filters at the end
                Int.MAX_VALUE
            }
        }

        // disable filters
        val disabledFilters: List<String>? = filterDisableMap?.getOrDefault(id, emptyList())
        val result = sortedFilters.filter { disabledFilters == null || !disabledFilters.contains(it.id) }
        result
    }

    /**
     * Run all registered Filter instances in the configured sequence
     *
     * NOTE Exceptions thrown by a filter must be handled by the client
     * and prevent succeeding filters from running.
     */
    fun runFilters(payload: T, context: Context): T {
        val profile = context.profile
        val parentProfile = context.parentProfile

        context.addMessage(Message(this, "Running filters on pipe '$id' for profile '$profile'"))

        if (!::extensions.isInitialized) {
            context.addMessage(Message(this, "No filters configured for pipe '$id'"))
            return payload
        }

        extensions.forEach {
            if (!filters.contains(it)) {
                context.addMessage(Message(this, "Skipped filter '${it.id}' because it is disabled by configuration"))
            }
        }

        // run filters
        var result: T = payload
        var filterException: Exception? = null
        for (filter in filters) {
            if (filter.usedInProfile(profile) || filter.usedInProfile(parentProfile)) {
                context.addMessage(Message(this, "Running filter '${filter.id}'"))
                try {
                    result = filter(result, context)
                } catch (e: Exception) {
                    log.error("Filter '${filter.id}' could not be executed, due to an error", e)
                    filterException = e
                }
            }
            else {
                context.addMessage(Message(this, "Skipped filter '${filter.id}' because it does not apply to profile '$profile'"))
            }
        }
        
        // throw an exception if one of the executed filter lead to an exception
        if (filterException != null) {
            throw filterException
        }
        
        return result
    }
}