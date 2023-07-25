package de.ingrid.igeserver.imports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.imports.internal.migrations.Migrate001
import de.ingrid.igeserver.imports.internal.migrations.Migrate002
import de.ingrid.igeserver.services.MapperService
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalImporter : IgeImporter {

    private val mapperService = MapperService()

    override fun run(catalogId: String, data: Any): JsonNode {
        val json = mapperService.getJsonNode((data as String))
        val version = json.get("_version").asText()

        var documents = json.get("resources")
        if (version == "0.0.1") {
            documents = Migrate001.migrate(documents as ArrayNode)
        } else if (version == "0.0.2") {
            documents = Migrate002.migrate(documents as ArrayNode)
        }
        val published = documents.get("published")
        val draft = documents.get("draft")
        return if (draft == null) {
            published
        } else {
            jacksonObjectMapper().createArrayNode().apply {
                add(published)
                add(draft)
            }
        }
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
