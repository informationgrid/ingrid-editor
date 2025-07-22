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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.model.RecordCollection
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.services.ExportResult
import de.ingrid.igeserver.utils.getBoolean
import org.springframework.stereotype.Service

@Service
class JsonFormatter(
    private val internalExporter: InternalExporter,
) : BodyFormatter {

    override val supportedContent = FormatContentTypes.JSON

    override fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String {
        val documents: MutableList<String> = mutableListOf()

        val jsonData: JsonNode = jacksonObjectMapper().readValue(data, JsonNode::class.java)
        if (jsonData.isArray) throw ClientException.withReason("Invalid request: JSON body must be a single object, not an array.")
        val document = if (jsonData.getBoolean("isGeojson") == true) {
            jsonData.get("properties")
        } else {
            jsonData
        }
        val publishedVersion = document.takeIf { publish }
        val draftVersion = document.takeIf { !publish }
        val docWithWrapper = internalExporter.addExportWrapper(collectionId, publishedVersion, draftVersion)
        documents.add(docWithWrapper.toString())

        return documents[0]
    }

    override fun basic(content: Any, title: String?): ByteArray = convertObject2Json(content).toString().toByteArray()

    override fun collections(collections: List<Any>, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        val response: MutableList<JsonNode> = mutableListOf()
        val list: List<RecordCollection> = collections as List<RecordCollection>
        for (catalog in list) {
            val wrapperlessCatalog = convertObject2Json(catalog)
            response.add(wrapperlessCatalog)
        }

        val mapper = jacksonObjectMapper()
        val recordArray = mapper.createArrayNode()
        response.forEach { recordArray.add(convertObject2Json(it)) }
        return recordArray.toString().toByteArray()
    }

    override fun records(records: List<ExportResult>, useDraft: Boolean, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        val response: MutableList<JsonNode> = mutableListOf()
        for (record in records) {
            var wrapperlessRecord = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
            val resources = wrapperlessRecord.get("resources")
            wrapperlessRecord = if (useDraft) resources.get("draft") else resources.get("published")
            response.add(wrapperlessRecord)
        }
        return if (isSingleRecord) response[0].toString().toByteArray() else response.toString().toByteArray()
    }
}
