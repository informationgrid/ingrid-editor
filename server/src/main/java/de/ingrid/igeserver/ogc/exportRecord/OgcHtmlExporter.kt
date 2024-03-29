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
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.ogc.OgcHtmlConverterService
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.stereotype.Service


@Service
@Profile("ogc-api")
class OgcHtmlExporter(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService,
        val ogcHtmlConverterService: OgcHtmlConverterService
) : IgeExporter {

    override val typeInfo = ExportTypeInfo(
            DocumentCategory.DATA,
            "html",
            "htmlIGE",
            "HTML Export des IGE",
            MediaType.TEXT_HTML_VALUE,
            "text/html",
            emptyList(),
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

        val exportData = selectDraftOrPublished(versions.first, versions.second)
        return ogcHtmlConverterService.convertObjectNode2Html(exportData, null)
    }

    fun runCollection(catalogId: String) {
        val catalog = catalogService.getCatalogById(catalogId)
        return
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

    private fun selectDraftOrPublished(publishedVersion: JsonNode?, draftVersion: JsonNode?): ObjectNode {
        return (draftVersion ?: publishedVersion) as ObjectNode
    }


    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }

}
