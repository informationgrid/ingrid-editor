package de.ingrid.igeserver.exports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class InternalExporter @Autowired constructor(@Lazy val documentService: DocumentService) : IgeExporter {

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

    override fun run(doc: Document, catalogId: String): Any {
        // TODO: profile must be added to the exported format!
        // TODO: move to utilities to prevent cycle
        val json = documentService.convertToJsonNode(doc)
        documentService.removeInternalFieldsForImport(json as ObjectNode)
        return addExportWrapper(json)
    }

    private fun addExportWrapper(json: JsonNode): ObjectNode {

        return jacksonObjectMapper().createObjectNode().apply {
            put("_export_date", OffsetDateTime.now().toString())
            put("_version", "0.0.2")
            put("resources", jacksonObjectMapper().createArrayNode().add(json))
        }

    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}
