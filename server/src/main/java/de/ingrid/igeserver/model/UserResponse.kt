package de.ingrid.igeserver.model

/**
 * UserResponse
 */
data class UserResponse(
    var user: User,
    var readOnly: Boolean = false
)
