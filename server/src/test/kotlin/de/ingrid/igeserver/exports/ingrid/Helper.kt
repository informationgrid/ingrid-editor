package de.ingrid.igeserver.exports.ingrid

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.exports.prettyFormatXml
import de.ingrid.igeserver.schema.SchemaUtils

fun exportJsonToXML(exporter: IgeExporter, file: String, additional: ObjectNode? = null): String {
    val input = SchemaUtils.getJsonFileContent(file)
    val doc = convertToDocument(input)
    
    if (additional != null) {
        doc.data.putAll(additional)
    }
    
    val result = exporter.run(doc, "test-catalog") as String
    return prettyFormatXml(result, 4).replace("\r\n", "\n")
}

fun exportJsonStringToXML(exporter: IgeExporter, json: String): String {
    val doc = convertToDocument(json)
    val result = exporter.run(doc, "test-catalog") as String
    return prettyFormatXml(result, 4).replace("\r\n", "\n")
}


fun exportJsonToJson(exporter: IgeExporter, file: String): String {
    val input = SchemaUtils.getJsonFileContent(file)
    val doc = convertToDocument(input)
    val result = exporter.run(doc, "test-catalog") as String
    return result
}
