package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode
import java.time.OffsetDateTime
import java.util.*
data class DocumentResponse(val document: JsonNode, val metadata: DocumentMetadata)

// TODO: rename fields with no underscore!
data class DocumentMetadata(
    val _id: String,
    val _created: OffsetDateTime,
    val _modified: OffsetDateTime,
    val _createdBy: String,
    val _modifiedBy: String,
    val _parent: String?,
    val _pendingDate: OffsetDateTime?,
    val _hasChildren: Boolean,
    val _state: String,
    val _version: Int,
    val hasWritePermission: Boolean,
    val hasOnlySubtreeWritePermission: Boolean
)

