package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import java.util.*

data class UserInfoData(
    var recentLogins: List<Long> = emptyList(),
    var catalogIds: List<String> = emptyList(),
    var currentCatalogId: String? = null,
    var creationDate: Date? = null,
    var modificationDate: Date? = null,
    var groups: MutableMap<String, List<String>> = mutableMapOf()
)
