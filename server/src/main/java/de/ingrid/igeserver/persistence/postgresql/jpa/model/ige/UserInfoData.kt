package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

data class UserInfoData(var recentLogins: List<Long>?, var catalogIds: List<String>?, var currentCatalogId: String?)
