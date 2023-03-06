package de.ingrid.igeserver.imports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.services.FIELD_ID
import de.ingrid.igeserver.services.FIELD_UUID
import de.ingrid.igeserver.services.MapperService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalImporter : IgeImporter {

    private val log = logger()

    private val mapperService = MapperService()

    override fun run(data: Any): JsonNode {
        val json = mapperService.getJsonNode((data as String))
        val version = json.get("_version").asText()

        var documents = json.get("resources")
        if (version == "0.0.1") {
           documents = migrateDocumentsFrom(documents as ArrayNode)
        }
        return documents
    }

    private fun migrateDocumentsFrom(documents: ArrayNode): ArrayNode {
        documents.forEach { document ->
            document as ObjectNode
            document.put(FIELD_UUID, document.get(FIELD_ID).asText())
            val addresses = document.get("addresses") as ArrayNode
            addresses.forEach { address ->
                val ref = (address as ObjectNode).get("ref") as ObjectNode
                ref.put(FIELD_UUID, ref.get(FIELD_ID).asText())
            }
        }

        return documents
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        val isJson = MediaType.APPLICATION_JSON_VALUE == contentType || MediaType.TEXT_PLAIN_VALUE == contentType
        val hasNecessaryFields =
            fileContent.contains("\"_export_date\"") && fileContent.contains("\"_version\"") && fileContent.contains("\"resources\"")
        return isJson && hasNecessaryFields
    }

    override val typeInfo: ImportTypeInfo
        get() = ImportTypeInfo(
            "internal",
            "Internes Format",
            "Datenformat, welches für die interne Verarbeitung verwendet wird",
            emptyList()
        )

}
