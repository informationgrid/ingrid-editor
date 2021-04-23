package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import org.springframework.stereotype.Component

@Component
class PermissionsData(
    val pages: JsonNode? = null,
    val actions: JsonNode? = null,
    val documents: ArrayNode? = null,
    val addresses: ArrayNode? = null
) : HashMap<String, Any?>(
    mapOf(
        "pages" to pages, "actions" to actions, "documents" to documents,
        "addresses" to addresses
    )
) {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "PermissionsData"
    }

}
