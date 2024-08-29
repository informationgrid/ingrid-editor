/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.node.ObjectNode
import java.time.OffsetDateTime

data class DocumentWithMetadata(
    val document: ObjectNode,
    val metadata: DocMetadata,
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
    val uuid: String,

)
