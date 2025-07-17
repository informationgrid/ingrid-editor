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
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.model.RecordsResponse
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.services.ExportResult
import org.springframework.stereotype.Service

@Service
class GeoJsonFormater : BodyFormater {

    override fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String = throw NotImplementedError("Import of records in format GEOJSON is not implemented.")

    override fun basic(content: Any, title: String?): ByteArray = convertObject2Json(content).toString().toByteArray()

    override fun collections(collections: List<Any>, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        // TODO How to export collections in GeoJson format?
        throw NotImplementedError()
    }

    override fun records(records: List<ExportResult>, useDraft: Boolean, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        val response: MutableList<JsonNode> = mutableListOf()
        for (record in records) {
            val wrapperlessRecord = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
            response.add(wrapperlessRecord)
        }
        return if (isSingleRecord) {
            response[0].toString().toByteArray()
        } else {
            val response = RecordsResponse(
                type = "FeatureCollection",
                timeStamp = queryMetadata!!.timeStamp,
                numberReturned = queryMetadata.numberReturned,
                numberMatched = queryMetadata.numberMatched,
                features = response,
                links = links,
            )
            val wrappedResponse = convertObject2Json(response)
            return wrappedResponse.toString().toByteArray(Charsets.UTF_8)
        }
    }

    override val typeInfo: FormaterTypeInfo
        get() = FormaterTypeInfo(
            "geojson",
            "GEOJSON Format",
            mimeTypes = listOf("application/geo+json"),
            exportType = "geojson",
        )
}
