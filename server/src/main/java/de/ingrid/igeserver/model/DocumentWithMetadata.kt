package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.node.ObjectNode
import java.time.OffsetDateTime

data class DocumentWithMetadata(
    val document: ObjectNode,
    val metadata: DocMetadata
)

data class DocMetadata(
    val hasChildren: Boolean,
    val parentId: Int?,
    val parentIsFolder: Boolean,
    // TODO: next two fields not really necessary, since they can be simply evaluated from doc
    val createdUserExists: Boolean,
    val modifiedUserExists: Boolean,
    val pendingDate: String?,
    val tags: String,
    val responsibleUser: Int?,
    val metadataDate: String?,
    val hasWritePermission: Boolean,
    val hasOnlySubtreeWritePermission: Boolean,
    val wrapperId: Int,
    val created: OffsetDateTime,
    val createdBy: String?,
    val modified: OffsetDateTime,
    val modifiedBy: String?,
    val contentModified: OffsetDateTime,
    val contentModifiedBy: String?,
    val state: String,
    val docType: String,
    val version: Int,
    val uuid: String

)
