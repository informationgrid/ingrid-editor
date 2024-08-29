/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.utils

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.KeyValue

/**
 * Get the text value of a given path in a JsonNode. The path is delimited by a "."
 */
fun JsonNode.getString(path: String): String? {
    return path.split(".")
        .fold<String, JsonNode?>(this) { node, fieldName ->
            node?.get(fieldName)
        }?.let { if (it.isNull) null else it.asText() }
}

fun JsonNode.getBoolean(path: String): Boolean? {
    return path.split(".")
        .fold<String, JsonNode?>(this) { node, fieldName ->
            node?.get(fieldName)
        }?.let { if (it.isNull) null else it.asBoolean() }
}

fun JsonNode.getDouble(path: String): Double? {
    return path.split(".")
        .fold<String, JsonNode?>(this) { node, fieldName ->
            node?.get(fieldName)
        }?.let { if (it.isNull) null else it.asDouble() }
}

fun JsonNode.getStringOrEmpty(path: String): String {
    return this.getString(path) ?: ""
}

fun JsonNode.getPath(path: String): JsonNode? {
    return path.split(".")
        .fold<String, JsonNode?>(this) { node, fieldName ->
            node?.get(fieldName)
        }
}

fun JsonNode.mapToKeyValue(): KeyValue? {
    if (this.isNull) return null
    return KeyValue(this.getString("key"), this.getString("value"))
}
