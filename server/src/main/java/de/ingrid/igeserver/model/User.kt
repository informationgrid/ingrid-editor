package de.ingrid.igeserver.model

/**
 * User
 */
data class User(
    val login: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    var role: String = "",
    var groups: List<String> = emptyList()
)
