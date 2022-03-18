package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode
import java.time.OffsetDateTime

data class DocumentResponse(val document: JsonNode, val metadata: DocumentMetadata)

data class DocumentMetadata(
    val id: String,
    val uuid: String,
    val created: OffsetDateTime,
    val modified: OffsetDateTime,
    val createdBy: String?,
    val modifiedBy: String?,
    val parent: String?,
    val pendingDate: OffsetDateTime?,
    val hasChildren: Boolean,
    val state: String,
    val version: Int,
    val hasWritePermission: Boolean,
    val hasOnlySubtreeWritePermission: Boolean
)

