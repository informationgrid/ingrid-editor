package de.ingrid.igeserver.model

import de.ingrid.igeserver.services.DocumentService
import java.time.OffsetDateTime

data class DocumentAbstract(
    val id: String?,
    val title: String?,
    val _uuid: String?,
    val _state: String?,
    val _hasChildren: Boolean?,
    val _parent: String?,
    val _type: String?,
    val _modified: OffsetDateTime?,
    val _pendingDate: OffsetDateTime?,
    val hasWritePermission: Boolean?,
    val hasOnlySubtreeWritePermission: Boolean
)