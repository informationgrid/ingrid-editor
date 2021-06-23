package de.ingrid.igeserver.model

import java.util.*

/**
 * User
 */
data class User(
    val login: String,
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    var role: String = "",
    var organisation: String = "",
    var manager: String = "",
    var standin: String? = null,
    var groups: List<Int> = emptyList(),
    var creationDate: Date = Date(0),
    var modificationDate: Date = Date(0),
    var latestLogin: Date? = null,
)
