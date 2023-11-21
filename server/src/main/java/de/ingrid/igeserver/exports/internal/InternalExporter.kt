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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class InternalExporter @Autowired constructor(
    @Lazy val documentService: DocumentService,
    val catalogService: CatalogService
) : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo(
            DocumentCategory.DATA,
            "internal",
            "IGE",
            "Interne Datenstruktur des IGE",
            MediaType.APPLICATION_JSON_VALUE,
            "json",
            listOf()
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
        return addExportWrapper(catalogId, versions.first, versions.second)
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

    fun addExportWrapper(catalogId: String, publishedVersion: JsonNode?, draftVersion: JsonNode?): ObjectNode {

        val profile = catalogService.getProfileFromCatalog(catalogId).identifier

        return jacksonObjectMapper().createObjectNode().apply {
            put("_export_date", OffsetDateTime.now().toString())
            put("_version", "1.0.0")
            put("_profile", profile)
            set<ObjectNode>("resources", jacksonObjectMapper().createObjectNode().apply {
                publishedVersion?.let { set<JsonNode>("published", publishedVersion) }
                draftVersion?.let { set<JsonNode>("draft", draftVersion) }
            })
        }

    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}
