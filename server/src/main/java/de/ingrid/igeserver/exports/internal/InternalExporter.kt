package de.ingrid.igeserver.exports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class InternalExporter @Autowired constructor(val documentService: DocumentService) : IgeExporter {

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

    override fun run(doc: Document): Any {
        // TODO: profile must be added to the exported format!
        val json = documentService.convertToJsonNode(doc)
        return addExportWrapper(json)
    }

    private fun addExportWrapper(json: JsonNode): ObjectNode {

        return jacksonObjectMapper().createObjectNode().apply { 
            put("_export_date", OffsetDateTime.now().toString())
            put("_version", "0.0.1")
            put("resources", jacksonObjectMapper().createArrayNode().add(json))
        }

    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}