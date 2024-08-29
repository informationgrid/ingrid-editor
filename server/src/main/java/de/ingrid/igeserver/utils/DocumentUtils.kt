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
package de.ingrid.igeserver.utils

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.DocMetadata
import de.ingrid.igeserver.model.DocumentWithMetadata
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DocumentData
import de.ingrid.igeserver.services.FIELD_DOCUMENT_TYPE
import de.ingrid.igeserver.services.FIELD_UUID
import java.time.format.DateTimeFormatter

fun documentInPublishedState(document: Document) =
    document.state == DOCUMENT_STATE.PUBLISHED || document.state == DOCUMENT_STATE.DRAFT_AND_PUBLISHED || document.state == DOCUMENT_STATE.PENDING

fun convertToDocument(docJson: JsonNode, docType: String? = null, docVersion: Int? = null, docUuid: String? = null): Document {
    return Document().apply {
        title = docJson.getStringOrEmpty("title")
        if (docType != null) type = docType
        if (docVersion != null) version = docVersion
        if (docUuid != null) uuid = docUuid

        // all document-data except title go into the data field
        data = (docJson as ObjectNode).apply { remove("title") }
    }
}

fun prepareDocumentWithMetadata(
    docData: DocumentData,
): DocumentWithMetadata {
    val metadata = DocMetadata(
        docData.wrapper.countChildren > 0,
        docData.wrapper.parent?.id,
        docData.wrapper.parent?.type == "FOLDER",
        docData.document.createdByUser != null,
        docData.document.contentModifiedByUser != null,
        docData.wrapper.pending_date?.format(DateTimeFormatter.ISO_DATE_TIME),
        docData.wrapper.tags.joinToString(","),
        docData.wrapper.responsibleUser?.id,
        docData.wrapper.fingerprint?.let { it[0].date.toString() },
        docData.wrapper.hasWritePermission,
        docData.wrapper.hasOnlySubtreeWritePermission,
        docData.wrapper.id!!,
        docData.document.created!!,
        docData.document.createdby,
        docData.document.modified!!,
        docData.document.modifiedby,
        docData.document.contentmodified!!,
        docData.document.contentmodifiedby,
        docData.document.state.getState(),
        docData.document.type,
        docData.document.version!!,
        docData.document.uuid,
    )
    val data = getRawJsonFromDocument(docData.document)
    return DocumentWithMetadata(data, metadata)
}

fun getRawJsonFromDocument(document: Document, includeMetadataForExport: Boolean = false): ObjectNode {
    return document.data.deepCopy().apply {
        put("title", document.title)
        if (includeMetadataForExport) {
            put(FIELD_UUID, document.uuid)
            put(FIELD_DOCUMENT_TYPE, document.type)
        }
    }
}
