package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.exports.prettyFormatXml
import de.ingrid.igeserver.schema.SchemaUtils

fun exportJson(exporter: IgeExporter, file: String): String {
    val input = SchemaUtils.getJsonFileContent(file)
    val doc = convertToDocument(input)
    val result = exporter.run(doc, "test-catalog") as String
    return prettyFormatXml(result, 4)
}