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
package de.ingrid.igeserver.features.ogc_api_records.export_record

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.features.ogc_api_records.model.Record
import de.ingrid.igeserver.features.ogc_api_records.model.RecordTime
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getRawJsonFromDocument
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class OgcGeoJsonExporter(
    @Lazy val documentService: DocumentService,
    val catalogService: CatalogService,
) : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo(
            DocumentCategory.DATA,
            "geojson",
            "geoJsonIGE",
            "geoJson Export des IGE",
            MediaType.APPLICATION_JSON_VALUE,
            "json",
            listOf(),
            false,
        )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val version = getRawJsonFromDocument(doc, true)

        val versions = if (options.includeDraft) {
            Pair(getPublished(catalogId, doc.uuid), version)
        } else {
            Pair(version, null)
        }

        val dataset = versions.first ?: versions.second
        val isAddress: Boolean = dataset?.get("address") != null
        if (isAddress) return dataset as Any
        val record = addExportWrapper(doc.uuid, versions.first, versions.second)
        return convertToJsonNode(record)
    }

    private fun getPublished(catalogId: String, uuid: String): JsonNode? {
        return try {
            val document = documentService.getLastPublishedDocument(catalogId, uuid, true)
            getRawJsonFromDocument(document)
        } catch (ex: Exception) {
            // allow to export only draft versions
            null
        }
    }

    private fun addExportWrapper(uuid: String, publishedVersion: JsonNode?, draftVersion: JsonNode?): Record {
        val dataset = publishedVersion ?: draftVersion

        val geometry: MutableList<JsonNode> = mutableListOf()
        val interval: MutableList<String> = mutableListOf()
        interval.add("..") // start date
        interval.add("..") // end date
        val time = RecordTime(interval, resolution = "P1D")

        return Record(
            id = jacksonObjectMapper().createObjectNode().textNode(uuid),
            conformsTo = null,
            type = "Feature",
            time,
            geometry,
            properties = dataset,
        )
    }

    fun convertToJsonNode(record: Record): JsonNode {
        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())

        val node = mapper.convertValue(record, ObjectNode::class.java)
        node.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}
