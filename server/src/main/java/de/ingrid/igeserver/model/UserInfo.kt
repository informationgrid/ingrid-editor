package de.ingrid.igeserver.model

import java.util.*

data class UserInfo(val userId: String? = null, val name: String, val assignedCatalogs: List<Catalog>, val roles: Set<String>, val currentCatalog: Catalog?, val version: Version, val lastLogin: Date?)

data class Version(val version: String?, val date: Date?, val commitId: String?)
