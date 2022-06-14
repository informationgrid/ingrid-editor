package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class UserInfoData(
    var recentLogins: List<Long> = emptyList(),
    var creationDate: Date? = null,
    var modificationDate: Date? = null,
    @Deprecated("use keycloak user for this information instead")
    var organisation: String? = null,
)
