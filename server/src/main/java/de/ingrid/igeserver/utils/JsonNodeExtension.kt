package de.ingrid.igeserver.utils

import com.fasterxml.jackson.databind.JsonNode

/**
 * Get the text value of a given path in a JsonNode. The path is delimited by a "."
 */
fun JsonNode.getString(path: String): String? {
    return path.split(".")
        .fold<String, JsonNode?>(this) { node, fieldName ->
            node?.get(fieldName)
        }?.asText()
}