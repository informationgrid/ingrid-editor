package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import org.springframework.stereotype.Component

@Component
data class PermissionsData(
    val pages: JsonNode? = null,
    val actions: JsonNode? = null,
    val documents: ArrayNode? = null,
    val addresses: ArrayNode? = null
)