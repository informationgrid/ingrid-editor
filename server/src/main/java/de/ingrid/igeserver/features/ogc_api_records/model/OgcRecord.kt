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
package de.ingrid.igeserver.features.ogc_api_records.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import java.time.Instant
import java.time.OffsetDateTime
data class RecordCollection(
        val id: String,
        val title: String,
        val description: String?,
        val links: String,
        val itemType: String,
        val type: String,
        val modelType: String,
        @JsonDeserialize(using = DateDeserializer::class)
        @JsonProperty("_created") val created: OffsetDateTime?,
        @JsonDeserialize(using = DateDeserializer::class)
        @JsonProperty("_modified")val updated: OffsetDateTime?,
)

data class Record(
        val id: JsonNode,
        val conformsTo: List<String>?,
        val type: String,
        val time: RecordTime?,
        val geometry: List<JsonNode>,
        val properties: JsonNode?,
)

data class RecordTime(
        val interval: List<String>,
        val resolution: String
)

data class RecordsResponse(
        val type: String,
        val timeStamp: Instant?,
        val numberReturned: Int?,
        val numberMatched: Int,
        val features: List<JsonNode>,
        val links: List<Link>?
)

data class Link(
        val href: String,
        val rel: String,
        val type: String,
        val title: String,
)


data class LimitAndOffset(
        val queryLimit: Int,
        val queryOffset: Int
)

data class Bbox(
        val lowerLeftLongitude: Float,
        val lowerLeftLatitude: Float,
        val upperRightLongitude: Float,
        val uppperRightLatitude: Float,
)