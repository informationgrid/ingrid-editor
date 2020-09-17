package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.JsonNode

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    fun run(jsonData: JsonNode): Any
    fun toString(exportedObject: Any): String
}