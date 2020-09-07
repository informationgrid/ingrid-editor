package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode
import java.time.OffsetDateTime

data class DataHistoryRecord(
        val id: String,
        val actor: String,
        val action: String,
        val time: OffsetDateTime,
        val data: JsonNode?
)