package de.ingrid.igeserver.imports.internal

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.ige.api.IgeImporter
import de.ingrid.igeserver.services.MapperService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalImporter : IgeImporter {

    private val log = logger()

    private val mapperService = MapperService()

    override fun run(data: Any): JsonNode {
        return mapperService.getJsonNode((data as String))
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        val isJson = MediaType.APPLICATION_JSON_VALUE == contentType || MediaType.TEXT_PLAIN_VALUE == contentType
        val hasNecessaryFields = fileContent.contains("\"_id\"") && fileContent.contains("\"_type\"") && fileContent.contains("\"_state\"")
        return isJson && hasNecessaryFields
    }

    override fun getName(): String {
        return "Internes Format"
    }

}