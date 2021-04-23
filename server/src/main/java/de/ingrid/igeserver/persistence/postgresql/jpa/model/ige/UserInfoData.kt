package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import java.util.*

data class UserInfoData(var recentLogins: List<Long>?, var catalogIds: List<String>?, var currentCatalogId: String?, var creationDate: Date?, var modificationDate: Date?, var groups: MutableMap<String, List<String>>?)
