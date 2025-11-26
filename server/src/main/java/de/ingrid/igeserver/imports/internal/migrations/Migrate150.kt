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
import org.apache.logging.log4j.kotlin.logger

class Migrate150 {

    companion object {
        private val log = logger()

        private val includedTypes = listOf(
            "InGridGeoDataset",
            "InGridDataCollection",
            "InGridGeoService",
            "InGridInformationSystem",
            "InGridPublication",
            "InGridProject",
            "InGridSpecialisedTask",
            "BawPublication",
            "BawMeasurement",
            "BawSimulation",
        )

        fun migrate(documents: JsonNode): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    val docType = docVersion.getString("_type") ?: return@let
                    if (includedTypes.contains(docType)) {
                        val migratedData = getTemporalOfDocument(docVersion)
                        docVersion.set<JsonNode>("temporal", migratedData)
                    }
                }
            }
            return documents
        }

        fun getTemporalOfDocument(doc: ObjectNode): JsonNode = jacksonObjectMapper().createObjectNode().apply {
            val temporal = doc.get("temporal") as? ObjectNode ?: return@apply

            // in case migration was already done -> return
            if (temporal.get("data") != null) return temporal

            // preserve status (even if null)
            temporal.get("status")?.let { statusNode ->
                this.set<JsonNode>("status", statusNode)
            }

            // migrate events -> event
            val eventNode = jacksonObjectMapper().createObjectNode()
            eventNode.set<JsonNode>("created", null)
            eventNode.set<JsonNode>("firstPublished", null)
            eventNode.set<JsonNode>("lastModified", null)

            val events = temporal.get("events") as? ArrayNode
            var createdDate: String? = null
            var firstPublished: String? = null
            var lastModified: String? = null
            events?.forEach { e ->
                val date = e.get("referenceDate")
                val typeKey = e.get("referenceDateType")?.get("key")?.asText()
                if (!date.isNull && date != null && typeKey != null) {
                    when (typeKey) {
                        "1" -> {
                            if (createdDate == null || (date.asText() < createdDate)) {
                                createdDate = date.asText()
                                eventNode.set<JsonNode>("created", date)
                            }
                        }

                        "2" -> {
                            if (firstPublished == null || (date.asText() < firstPublished)) {
                                firstPublished = date.asText()
                                eventNode.set<JsonNode>("firstPublished", date)
                            }
                        }

                        "3" -> {
                            if (lastModified == null || (date.asText() > lastModified)) {
                                lastModified = date.asText()
                                eventNode.set<JsonNode>("lastModified", date)
                            }
                        }
                    }
                } else if (!date.isNull && date != null && typeKey == null) {
                    log.warn("Found event without referenceDateType: $date in document ${doc.getString("_uuid")}")
                }
            }
            this.set<JsonNode>("event", eventNode)

            val resourceDate = temporal.get("resourceDate")

            val dataNode = jacksonObjectMapper().createObjectNode().apply {
                val typeFrom = temporal.get("resourceDateType")?.get("key")?.asText()
                val typeSince = temporal.get("resourceDateTypeSince")?.get("key")?.asText()
                if (typeFrom == null) {
                    put("type", "none")
                } else if (typeFrom == "at") {
                    put("type", "at")
                    set<JsonNode>("resourceDate", resourceDate)
                } else {
                    val resourceRange = temporal.get("resourceRange")
                    put("type", "range")
                    put("intervalFrom", determineIntervalFrom(typeFrom))
                    put("intervalTo", determineIntervalTo(typeFrom, typeSince))
                    if (resourceDate != null && !resourceDate.isNull) {
                        set<JsonNode>("resourceDate", resourceDate)
                    }
                    if (resourceRange != null && !resourceRange.isNull) {
                        set<JsonNode>("resourceRange", resourceRange)
                    }
                }

                // preserve timezone (even if null)
                set<JsonNode>("timezone", temporal.get("resourceTimezone"))
            }
            this.set<JsonNode>("data", dataNode)
        }

        private fun determineIntervalFrom(type: String): String = when (type) {
            "till" -> "not-available"
            else -> "date"
        }

        private fun determineIntervalTo(typeFrom: String, typeSince: String?): String = when (typeFrom) {
            "since" -> when (typeSince) {
                "exactDate" -> "date"
                "requestTime" -> "continuously"
                else -> "not-available"
            }
            "till" -> "date"
            else -> "not-available"
        }
    }
}
