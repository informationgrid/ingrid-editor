package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component

@Component
data class PermissionsData(
    @JsonIgnoreProperties
    val pages: JsonNode? = null,
    @JsonIgnoreProperties
    val actions: JsonNode? = null,
    var documents: List<JsonNode>? = null,
    var addresses: List<JsonNode>? = null
)