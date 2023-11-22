package de.ingrid.igeserver.extension.pipe

import java.security.Principal

/**
 * Interface for contexts providing or collecting additional information when running the filters in a pipe
 */
interface Context {

    /**
     * Name of the profile to which the pipe payload belongs, used to select matching filters
     *
     * NOTE Null means *no profile*, which means that only filters matching *all profiles* will be active
     */
    val profile: String
    val parentProfile: String?

    /**
     * The catalog the operation is to be executed
     */
    val catalogId: String

    val principal: Principal?

    /**
     * Properties holding additional information that could also be shared between filters
     *
     * NOTE Due to the dynamic configuration of pipes, filters should not make any assumptions
     * about other filters setting specific properties.
     */
    val properties: Map<String, Any?>

    /**
     * Add a message to the context
     */
    fun addMessage(msg: Message)

    /**
     * Remove all messages
     */
    fun clearMessages()

    /**
     * Get the message iterator
     */
    fun messages(): Iterable<Message>
}
