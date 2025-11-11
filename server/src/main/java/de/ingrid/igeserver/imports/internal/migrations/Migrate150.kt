/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.utils.getString

class Migrate150 {

    companion object {
        private val includedTypes = listOf(
            "InGridGeoDataset",
            "InGridDataCollection",
            "InGridGeoService",
            "InGridInformationSystem",
            "InGridPublication",
            "InGridProject",
            "InGridSpecialisedTask",
        )

        fun migrate(documents: JsonNode): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    val docType = docVersion.getString("_type") ?: return@let
                    if (includedTypes.contains(docType)) {
                        val migratedData = getTemporalOfDocument(docVersion, docType)
                        docVersion.set<JsonNode>("temporal", migratedData)
                    }
                }
            }
            return documents
        }

        fun getTemporalOfDocument(doc: ObjectNode, docType: String): JsonNode = jacksonObjectMapper().createObjectNode().apply {
            val temporal = doc.get("temporal") as? ObjectNode ?: return@apply

            // preserve status (even if null)
            temporal.get("status")?.let { statusNode ->
                this.set<JsonNode>("status", statusNode)
            }

            // migrate events -> event
            val eventNode = jacksonObjectMapper().createObjectNode()
            val events = temporal.get("events") as? ArrayNode
            events?.forEach { e ->
                val date = e.get("referenceDate")
                val typeKey = e.get("referenceDateType")?.get("key")?.asText()
                if (date != null && typeKey != null) {
                    when (typeKey) {
                        "1" -> eventNode.set<JsonNode>("created", date)
                        "2" -> eventNode.set<JsonNode>("firstPublished", date)
                        "3" -> eventNode.set<JsonNode>("lastModified", date)
                    }
                }
            }
            this.set<JsonNode>("event", eventNode)

            // migrate resource date info -> data
            val resourceDate = temporal.get("resourceDate")
            // Only migrate when resourceDate exists and is not null
            if (resourceDate != null && !resourceDate.isNull) {
                val dataNode = jacksonObjectMapper().createObjectNode().apply {
                    // As per spec: type can be "at" or "range". Legacy has only a single date, so use "at".
                    put("type", "at")
                    // With a single instant, set both intervals to "date" so exporter treats it as a point-in-time
                    put("intervalFrom", "date")
                    put("intervalTo", "date")
                    set<JsonNode>("resourceDate", resourceDate)
                    // timezone ignored; resourceRange only set when both intervalFrom and intervalTo are set
                }
                this.set<JsonNode>("data", dataNode)
            }
        }
    }
}
