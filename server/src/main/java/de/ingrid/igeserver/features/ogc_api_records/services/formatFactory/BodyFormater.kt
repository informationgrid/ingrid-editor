/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.formatFactory

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.services.ExportResult
import java.text.SimpleDateFormat

interface BodyFormater {

    val typeInfo: FormaterTypeInfo

    fun basic(content: Any, title: String?): ByteArray

    fun collections(collections: List<Any>, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray

    // TODO RENAME formatRecordsForExport format.recordsBeforeExport
    fun records(records: List<ExportResult>, useDraft: Boolean, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray

    fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String

    fun convertObject2Json(data: Any): ObjectNode {
        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())
        mapper.dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        val node = mapper.convertValue(data, ObjectNode::class.java)
        node.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node
    }
}
