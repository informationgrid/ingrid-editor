/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.github.fge.jsonpatch.JsonPatch
import com.gravity9.jsonpatch.mergepatch.JsonMergePatch
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.services.DocumentService
import org.springframework.http.MediaType

data class IgeJsonPatch(
    val uuid: String,
    val jsonPatch: JsonPatch?,
    val jsonMerge: JsonMergePatch?,
)

class JsonMergePatchImporter(val documentService: DocumentService) : IgeImporter {
    override val typeInfo: ImportTypeInfo
        get() = ImportTypeInfo(
            "internalJsonMergePatch",
            "JSON Merge Patch",
            "Partielle Updates für existierende Dokumente in einem JSON-Merge-Patch-Format.",
            emptyList(),
        )

    override fun run(catalogId: String, data: Any, addressMaps: MutableMap<String, String>): JsonNode {
        val input: IgeJsonPatch = jacksonObjectMapper().readValue(data as String, IgeJsonPatch::class.java)
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, input.uuid)
        val doc = documentService.getDocumentByWrapperId(catalogId, wrapper.id!!)
        if (input.jsonPatch == null && input.jsonMerge == null) throw ServerException.withReason("No patch found")
        if (input.jsonPatch != null && input.jsonMerge != null) throw ServerException.withReason("Both patch and merge patch found")

        val patchedNode: JsonNode? = input.jsonPatch?.apply(doc.data) ?: input.jsonMerge?.apply(doc.data)

        // TODO: handle title differently since it is not in data-field

        return jacksonObjectMapper().treeToValue(patchedNode, JsonNode::class.java)
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        val isJson = MediaType.APPLICATION_JSON_VALUE == contentType || MediaType.TEXT_PLAIN_VALUE == contentType
        val hasNecessaryFields =
            fileContent.contains("\"uuid\"") && fileContent.contains("\"jsonPatch\"")
        return isJson && hasNecessaryFields
    }
}
