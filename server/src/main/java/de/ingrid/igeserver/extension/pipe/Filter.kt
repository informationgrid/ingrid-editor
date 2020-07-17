package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.extension.Extension

/**
 * Interface for filters running inside a pipe
 *
 * A filter is called with the content to be filtered (payload) and a filter context and returns
 * the filtered content. The context is used to collect or provide additional information.
 * Each filter implementation can only operate on a specific payload type (and it's subtypes).
 *
 * NOTE Exceptions thrown by a filter prevent succeeding filters in the pipe from running.
 * This allows filters to reject further processing of the payload but also implies that
 * non-fatal exceptions should be handled by the filter itself.
 */
interface Filter<T: Payload> : Extension, (T, Context) -> T {

    override val id: String
        get() = this::class.qualifiedName ?: this::class.toString()
}