package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode
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
        val created: OffsetDateTime?,
        val updated: OffsetDateTime?,
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
        val features: List<Record>,
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