package de.ingrid.igeserver.model

import java.util.*

/**
 * UserResponse
 */
data class UserResponse(
    var user: User,
    var readOnly: Boolean = false
)
