package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.JsonNode
import java.io.IOException

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    fun run(jsonData: JsonNode): Any
    fun toString(exportedObject: Any): String
}