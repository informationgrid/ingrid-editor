package de.ingrid.igeserver.model

/**
 * Message
 */
data class Message(
    var text: String,
)

data class MessageCreationRequest(
    var message: Message,
    var validUntil: String?,
    var forCurrentCatalog: Boolean,
)
