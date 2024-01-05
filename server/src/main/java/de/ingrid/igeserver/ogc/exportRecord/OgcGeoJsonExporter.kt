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
package de.ingrid.igeserver.ogc.exportRecord

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.RecordTime
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import de.ingrid.igeserver.model.Record

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
                false
        )
    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        // TODO: move to utilities to prevent cycle
        val version = documentService.convertToJsonNode(doc)
        documentService.removeInternalFieldsForImport(version as ObjectNode)

        val versions = if (options.includeDraft) {
            Pair(getPublished(catalogId, doc.uuid), version)
        } else {
            Pair(version, null)
        }

        val dataset = versions.first ?: versions.second
        val isAddress: Boolean = if(dataset?.get("address") == null) false else true
        if(isAddress) return dataset as Any
        val record = addExportWrapper(catalogId, versions.first, versions.second)
        return convertToJsonNode(record)
    }

    private fun getPublished(catalogId: String, uuid: String): JsonNode? {
        return try {
            val document = documentService.getLastPublishedDocument(catalogId, uuid, true)
            documentService.convertToJsonNode(document)
        } catch (ex: Exception) {
            // allow to export only draft versions
            null
        }
    }

    private fun addExportWrapper(catalogId: String, publishedVersion: JsonNode?, draftVersion: JsonNode?): Record {

        val dataset = publishedVersion ?: draftVersion

        val geometry: MutableList<JsonNode> = mutableListOf()
        val interval: MutableList<String> = mutableListOf()
        interval.add("..") // start date
        interval.add("..") // end date
        val time = RecordTime( interval, resolution = "P1D" )

        return Record(
                id = dataset!!.get("_uuid"),
                conformsTo = null,
                type = "Feature",
                time,
                geometry,
                properties = dataset
        )
    }

    fun convertToJsonNode(record: Record): JsonNode {

        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())

        val node = mapper.convertValue(record, ObjectNode::class.java)
        val data = node
        data.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node

    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }



}