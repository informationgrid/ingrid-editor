/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.imports.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.imports.internal.migrations.Migrate001
import de.ingrid.igeserver.imports.internal.migrations.Migrate002
import de.ingrid.igeserver.imports.internal.migrations.Migrate110
import de.ingrid.igeserver.services.MapperService
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalImporter : IgeImporter {

    private val mapperService = MapperService()

    override fun run(catalogId: String, data: Any, addressMaps: MutableMap<String, String>): JsonNode {
        val json = mapperService.getJsonNode((data as String))
        var additionalReferences = emptyList<JsonNode>()
        var version = json.get("_version").asText()

        var documents = json.get("resources")
        if (version == "0.0.1") {
            documents = Migrate001.migrate(documents as ArrayNode)
            version = "0.0.2"
        }
        if (version == "0.0.2") {
            documents = Migrate002.migrate(documents as ArrayNode)
            version = "1.0.0"
        }
        if (version == "1.0.0") {
            val response = Migrate110.migrate(documents)
            documents = response.documents
            additionalReferences = response.references
        }

        return jacksonObjectMapper().createArrayNode().apply {
            add(jacksonObjectMapper().createArrayNode().apply {
                add(documents.get("published"))
                add(documents.get("draft"))
            })
            if (additionalReferences.isNotEmpty()) addAll(additionalReferences)
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
