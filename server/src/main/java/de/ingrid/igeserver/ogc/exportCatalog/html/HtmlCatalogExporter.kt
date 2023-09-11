package de.ingrid.igeserver.ogc.exportCatalog.html


import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ogc.exportCatalog.CatalogExportTypeInfo
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.keycloak.util.JsonSerialization.mapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service


@Service
class HtmlCatalogExporter @Autowired constructor(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService
) : OgcCatalogExporter {

    override val typeInfo: CatalogExportTypeInfo
        get() = CatalogExportTypeInfo(
                DocumentCategory.DATA,
                "html",
                "IGE Catalog in HTML",
                "HTML Representation des IGE Catalog",
                MediaType.TEXT_HTML_VALUE,
                "html",
                listOf()
        )

    override fun run(catalog: Catalog): Any {
        val objectNode: ObjectNode = mapper.valueToTree(catalog)
        return htmlTransformation(objectNode)
    }


    private fun convertFieldToTable(node: JsonNode): String{
        var table = "<table>"
        if ( node.isTextual )
            table += "<td>${node.toString()}</td>" // addRow("", node.toString());
        else
            node.fields().forEach {  element ->
                val key = element.key ?: ""
                val value = element.value
                when (value.nodeType) {
                    JsonNodeType.NULL   -> table += addRow(key, "null")
                    JsonNodeType.STRING -> table += addRow(key, value.toString())
                    JsonNodeType.OBJECT -> table += addRow(key, convertFieldToTable(value))
                    JsonNodeType.ARRAY  -> { value.forEach { it -> table += addRow(key, convertFieldToTable(it)) } }
                    else -> table += addRow(key, value.toString())
                }
            }
        return "$table</table>"
    }

    private fun addRow(key: String, value: String): String{
        return "<tr><td style='width:160px'><b>$key</b></td><td>$value</td></tr>"
    }

    private fun htmlTransformation(doc: ObjectNode): String{
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