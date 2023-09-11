package de.ingrid.igeserver.ogc.exportRecord

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.ObjectNode
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


@Service
class OgcHtmlExporter @Autowired constructor(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService,
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
        return htmlTransformation(exportData)
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

    private fun convertFieldToTable(node: JsonNode): String {
        var table = "<table>"
        if (node.isTextual)
            table += "<td>${node.toString()}</td>" // addRow("", node.toString());
        else
            node.fields().forEach { element ->
                val key = element.key ?: ""
                val value = element.value
                when (value.nodeType) {
                    JsonNodeType.NULL -> table += addRow(key, "null")
                    JsonNodeType.STRING -> table += addRow(key, value.toString())
                    JsonNodeType.OBJECT -> table += addRow(key, convertFieldToTable(value))
                    JsonNodeType.ARRAY -> {
                        value.forEach { it -> table += addRow(key, convertFieldToTable(it)) }
                    }

                    else -> table += addRow(key, value.toString())
                }
            }
        return "$table</table>"
    }

    private fun addRow(key: String, value: String): String {
        return "<tr><td style='width:160px'><b>$key</b></td><td>$value</td></tr>"
    }

    private fun htmlTransformation(doc: ObjectNode): String {
        val table = convertFieldToTable(doc)
        return """
            <html>
                <head>
                    <title>OGC Record API</title>
                </head>
                <body>
                    <style>
                        body { font-family: Sans-Serif; background-color: lightGray; padding-bottom: 50px }
                        table { text-align:left; width: 100%; border-spacing: 0; border-collapse: collapse;}
                        td { vertical-align: top; outline: 2px solid lightGray; background-color: white;}}   
                    </style>
                    <h1>OGC Record API</h1>
                    $table
                </body>
            </html>
        """
    }


}
