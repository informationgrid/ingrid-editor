package de.ingrid.igeserver.imports.internal

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.ige.api.IgeImporter
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.services.MapperService.Companion.getJsonNode
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class InternalImporter : IgeImporter {

    private val log = logger()

    override fun run(data: Any): JsonNode {
        try {
            return getJsonNode((data as String))
        } catch (e: Exception) {
            log.error("Error during conversion of document to JsonNode", e)
            throw ApiException("Error during conversion of document to JsonNode: " + e.message)
        }
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        val isJson = "application/json" == contentType || "text/plain" == contentType
        val hasNecessaryFields = fileContent.contains("\"_id\"") && fileContent.contains("\"_type\"") && fileContent.contains("\"_state\"")
        return isJson && hasNecessaryFields
    }

    override fun getName(): String {
        return "Internes Format"
    }

}