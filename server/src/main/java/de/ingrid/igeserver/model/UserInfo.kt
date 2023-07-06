package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import java.util.*

data class UserInfo(
    val userId: String? = null,
    val name: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val assignedCatalogs: List<Catalog>,
    val role: String?,
    val groups: Set<String>?,
    val currentCatalog: Catalog?,
    val version: Version,
    val lastLogin: Date?,
    val externalHelp: String?,
    val useElasticsearch: Boolean?,
    val permissions: List<String>,
    var parentProfile: String? = null
)

data class Version(val version: String?, val date: Date?, val commitId: String?)
