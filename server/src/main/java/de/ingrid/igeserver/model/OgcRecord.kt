package de.ingrid.igeserver.model

import java.time.OffsetDateTime
import java.util.*


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

data class RecordOverview(
        val title: String?,
        val id: String?,
        val data: String,
        val created: Date?,
        val updated: Date?,
)

data class LimitAndOffset(
        val queryLimit: Int,
        val queryOffset: Int
)