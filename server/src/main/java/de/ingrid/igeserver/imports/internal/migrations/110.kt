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
package de.ingrid.igeserver.imports.internal.migrations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.utils.getString

data class Migrate110Response(
    val documents: JsonNode,
    val references: List<JsonNode>
)

class Migrate110 {

    companion object {
        fun migrate(documents: JsonNode, profile: String): Migrate110Response {
            val addressRefs = mutableListOf<JsonNode>()

            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    removeMetadata(docVersion)
                    val addresses = getAddresses(docVersion, profile)?.map {
                        val uuid = it.getString("ref._uuid")
                        val ref = it.get("ref")
                        (it as ObjectNode).put("ref", uuid)
                        ref
                    }
                    addresses
                        ?.filter { address -> addressRefs.none { it.getString("_uuid") == address.getString("_uuid") } }
                        ?.map { removeMetadata(it) }
                        ?.distinctBy { it.getString("_uuid") }
                        ?.let { addressRefs.addAll(it) }

                }
            }
            return Migrate110Response(documents, addressRefs)
        }

        private fun getAddresses(document: JsonNode, profile: String): ArrayNode? {
            return when (profile) {
                "mcloud" -> (document.get("addresses") as ArrayNode?)
                else -> (document.get("pointOfContact") as ArrayNode?)
            }
        }

        private fun removeMetadata(it: JsonNode?): JsonNode {
            it as ObjectNode
            it.remove("_created")
            it.remove("_modified")
            it.remove("_contentModified")
            it.remove("_createdBy")
            it.remove("_modifiedBy")
            it.remove("_contentModifiedBy")
            it.remove("_id")
            it.remove("_tags")
            return it
        }
    }
}
