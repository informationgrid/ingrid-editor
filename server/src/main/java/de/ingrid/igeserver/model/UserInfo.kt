package de.ingrid.igeserver.model

data class UserInfo(val userId: String? = null, val name: String, val assignedCatalogs: List<Catalog>, val roles: Set<String>, val currentCatalog: Catalog?)