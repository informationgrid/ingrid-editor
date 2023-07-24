package de.ingrid.igeserver.imports.internal.migrations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class Migrate002 {

    companion object {
        fun migrate(documents: ArrayNode): JsonNode {
            val result = jacksonObjectMapper().createObjectNode()
            result.set<JsonNode>("published", documents[0])
            return result
        }
    }
}