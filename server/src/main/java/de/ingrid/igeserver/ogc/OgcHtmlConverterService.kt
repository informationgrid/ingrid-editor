package de.ingrid.igeserver.ogc

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.ObjectNode
import org.springframework.stereotype.Service

@Service
class OgcHtmlConverterService {

    fun convertObjectNode2Html(doc: ObjectNode, type: String?): String {
        val table = convertFieldToTable(doc)
        val title = doc.get("title") ?: ""
        val collectionId: String? = doc["id"]?.toString()?.drop(1)?.dropLast(1)

        val h1 = if(type == null) {
            """<h1>Record: $title</h1>"""
        } else if (type == "Collection") {
            """<h1>Collection: <a href='/api/ogc/collections/${collectionId}?f=html'>${doc["name"].toString().drop(1).dropLast(1)}</a></h1>
               <p>Link to <a href='/api/ogc/collections/${collectionId}/items?f=html'">Records</a><p/>
            """.trimMargin()
        } else {
            "<h1>$type</h1>"
        }

        return """
                 <style>
                    body { font-family: Sans-Serif; padding-bottom: 50px }
                    table { text-align:left; width: 100%; border-spacing: 0; border-collapse: collapse;}
                    td { vertical-align: top; outline: 2px solid lightGray; background-color: white;}}
                </style>
                <div class="record" style="margin: 40px 10px; padding: 10px; outline: solid; background: lightgray;">
                    $h1
                    $table
                </div>
        """
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

}