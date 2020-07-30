package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode

interface ExportPostProcessors {
    enum class TransformationType {
        ISO
    }

    fun process(exportedDoc: Any?, jsonData: JsonNode): Any?
    val type: TransformationType
}