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
package de.ingrid.igeserver.exports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getRawJsonFromDocument
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class InternalExporter(
    @Lazy val documentService: DocumentService,
    val catalogService: CatalogService,
) : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo(
            DocumentCategory.DATA,
            "internal",
            "IGE",
            "Interne Datenstruktur des IGE",
            MediaType.APPLICATION_JSON_VALUE,
            "json",
            listOf(),
        )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val version = getRawJsonFromDocument(doc, true)

        val versions = if (options.includeDraft) {
            Pair(getPublished(catalogId, doc.uuid), version)
        } else {
            Pair(version, null)
        }
        return addExportWrapper(catalogId, versions.first, versions.second)
    }

    private fun getPublished(catalogId: String, uuid: String): JsonNode? {
        return try {
            val document = documentService.getLastPublishedDocument(catalogId, uuid, true)
            getRawJsonFromDocument(document, true)
        } catch (ex: Exception) {
            // allow to export only draft versions
            null
        }
    }

    fun addExportWrapper(catalogId: String, publishedVersion: JsonNode?, draftVersion: JsonNode?): ObjectNode {
        val profile = catalogService.getProfileFromCatalog(catalogId).identifier

        return jacksonObjectMapper().createObjectNode().apply {
            put("_export_date", OffsetDateTime.now().toString())
            put("_version", "1.1.0")
            put("_profile", profile)
            set<ObjectNode>(
                "resources",
                jacksonObjectMapper().createObjectNode().apply {
                    publishedVersion?.let { set<JsonNode>("published", publishedVersion) }
                    draftVersion?.let { set<JsonNode>("draft", draftVersion) }
                },
            )
        }
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}
