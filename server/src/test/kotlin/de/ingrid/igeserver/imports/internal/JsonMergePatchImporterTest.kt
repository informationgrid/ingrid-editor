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
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DocumentService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.every
import io.mockk.mockk

class JsonMergePatchImporterTest : AnnotationSpec() {

    private val documentService = mockk<DocumentService>()
    private val catalogId = "testCatalog"
    private val importer = JsonMergePatchImporter(documentService)

    @BeforeEach
    fun setup() {
        every { documentService.getWrapperByCatalogAndDocumentUuid(catalogId, "1") } returns DocumentWrapper().apply { id = 2 }
        every { documentService.getDocumentByWrapperId(catalogId, 2) } returns Document().apply {
            id = 2
            title = "Test Document"
            data = jacksonObjectMapper().readValue("""{"test": "abc"}""", ObjectNode::class.java)
        }
    }

    @Test
    fun successfulPatch() {
        // Use a simple JSON object as the patch
        val patchJson = """{"uuid": "1", "type": "SomeDocType", "jsonPatch": [{"op": "replace", "path": "/test", "value": "xyz"}]}"""

        // Just verify that the method doesn't throw an exception
        val result = importer.run(catalogId, patchJson, mutableMapOf())

        // Verify that the result is a JsonNode
        result.shouldBeInstanceOf<JsonNode>()
        result.toString() shouldBe """{"test":"xyz"}"""
    }

    @Test
    fun successfulMergePatch() {
        // Use a simple JSON object as the merge patch
        val patchJson = """{"uuid": "1", "type": "SomeDocType", "jsonMerge": {"test": "xyz"}}"""

        // Just verify that the method doesn't throw an exception
        val result = importer.run(catalogId, patchJson, mutableMapOf())

        // Verify that the result is a JsonNode
        result.shouldBeInstanceOf<JsonNode>()
        result.toString() shouldBe """{"test":"xyz"}"""
    }

    @Test
    fun exceptionWhenBothDefined() {
        // Use a simple JSON object as the merge patch
        val patchJson = """{"uuid": "1", "type": "SomeDocType", "jsonMerge": {"test": "xyz"}, "jsonPatch": [{"op": "replace", "path": "/test", "value": "abc"}]}"""

        shouldThrow<ServerException> {
            importer.run(catalogId, patchJson, mutableMapOf())
        }
    }
}
