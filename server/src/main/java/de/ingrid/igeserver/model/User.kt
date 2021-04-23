package de.ingrid.igeserver.model

import java.util.*

/**
 * User
 */
data class User(
    val login: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    var role: String = "",
    var manager: String = "",
    var standin: String?,
    var groups: List<String> = emptyList(),
    var creationDate: Date = Date(0),
    var modificationDate: Date = Date(0),
    var latestLogin: Date?,
)
