package de.ingrid.igeserver.extension.pipe

import java.util.*

/**
 * Interface for contexts used to provide or collect additional information when running the filters in a pipe
 */
interface Context {

    /**
     * List of messages collected while running the filters in a pipe
     */
    val messages: Queue<Message>

    /**
     * Properties holding additional information that could also be shared between filters
     *
     * NOTE Due to the dynamic configuration of pipes, filters should not make any assumptions
     * about other filters setting specific properties.
     */
    val properties: Map<String, Any?>
}