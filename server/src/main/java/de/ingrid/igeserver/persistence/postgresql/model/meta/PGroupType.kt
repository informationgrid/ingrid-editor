package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component

@Component
@JsonIgnoreProperties(ignoreUnknown = true)
data class PermissionsData(
    val rootPermission: RootPermissionType? = null,
    var documents: List<JsonNode>? = null,
    var addresses: List<JsonNode>? = null
)

enum class RootPermissionType {
    READ, WRITE
}
