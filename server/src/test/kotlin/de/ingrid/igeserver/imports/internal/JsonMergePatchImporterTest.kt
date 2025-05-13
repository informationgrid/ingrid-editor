/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DocumentService
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.every
import io.mockk.mockk

class JsonMergePatchImporterTest : AnnotationSpec() {

    private val documentService = mockk<DocumentService>()

    @Test
    fun successfulPatch() {
        val catalogId = "testCatalog"
        every { documentService.getWrapperByCatalogAndDocumentUuid(catalogId, "1") } returns DocumentWrapper().apply { id = 2 }
        every { documentService.getDocumentByWrapperId(catalogId, 2) } returns Document().apply {
            id = 2
            title = "Test Document"
            data = jacksonObjectMapper().readValue("""{"test": "abc"}""", ObjectNode::class.java)
        }

        val importer = JsonMergePatchImporter(documentService)
        // Use a simple JSON object as the patch
        val patchJson = """{"uuid": "1", "jsonPatch": [{"op": "replace", "path": "/test", "value": "xyz"}]}"""
        val addressMaps = mutableMapOf<String, String>()

        // Just verify that the method doesn't throw an exception
        val result = importer.run(catalogId, patchJson, addressMaps)

        // Verify that the result is a JsonNode
        result.shouldBeInstanceOf<JsonNode>()
        result.toString() shouldBe """{"test":"xyz"}"""
    }
}
