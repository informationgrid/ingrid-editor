package de.ingrid.igeserver.exports.internal

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalExporter : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo("internal", "IGE", "Interne Datenstruktur des IGE", MediaType.APPLICATION_JSON_VALUE, "json", listOf())

    override fun run(jsonData: JsonNode): Any {
        // TODO: profile must be added to the exported format!
        return jsonData.toPrettyString()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject as String
    }
}