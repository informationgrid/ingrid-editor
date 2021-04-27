package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import java.util.*

data class UserInfo(val userId: String? = null,
                    val name: String,
                    val firstName: String,
                    val lastName: String, 
                    val assignedCatalogs: List<Catalog>,
                    val roles: Set<String>?, 
                    val currentCatalog: Catalog?, 
                    val version: Version,
                    val lastLogin: Date?,
                    val useElasticsearch: Boolean?)

data class Version(val version: String?, val date: Date?, val commitId: String?)
