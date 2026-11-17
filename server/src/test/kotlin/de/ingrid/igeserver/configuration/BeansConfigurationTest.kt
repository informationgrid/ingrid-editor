/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.model.DocMetadata
import de.ingrid.igeserver.model.DocumentWithMetadata
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.hibernate.cfg.AvailableSettings
import org.hibernate.type.format.jackson.Jackson3JsonFormatMapper
import tools.jackson.databind.JsonNode
import tools.jackson.databind.node.JsonNodeFactory
import java.time.OffsetDateTime
import java.time.ZoneOffset

class BeansConfigurationTest : AnnotationSpec() {

    private val objectMapper = BeansConfiguration().objectMapper()

    @Test
    fun `test DocumentWithMetadata serialization`() {
        val now = OffsetDateTime.of(2026, 1, 1, 12, 0, 0, 0, ZoneOffset.UTC)
        val metadata = DocMetadata(
            hasChildren = false,
            parentId = null,
            parentDocType = null,
            createdUserExists = true,
            modifiedUserExists = true,
            pendingDate = null,
            tags = emptyList(),
            responsibleUser = null,
            metadataDate = null,
            hasWritePermission = true,
            hasOnlySubtreeWritePermission = false,
            wrapperId = 1,
            created = now,
            createdBy = "admin",
            modified = now,
            modifiedBy = "admin",
            contentModified = now,
            contentModifiedBy = "admin",
            state = "DRAFT",
            docType = "InGridDataset",
            version = 1,
            uuid = "uuid-123",
        )
        val objectNode = JsonNodeFactory.instance.objectNode().put("title", "Test Title")
        val docWithMeta = DocumentWithMetadata(objectNode, metadata)

        val result = objectMapper.writeValueAsString(docWithMeta)
        val json = objectMapper.readTree(result)
        json.get("document").get("title").asString() shouldBe "Test Title"
        json.get("metadata").get("uuid").asString() shouldBe "uuid-123"
    }

    @Test
    fun `jsonFormatMapperCustomizer configures Jackson 3 format mapper for JsonNode`() {
        val customizer = BeansConfiguration().jsonFormatMapperCustomizer()
        val properties = mutableMapOf<String, Any>()
        customizer.customize(properties)

        val mapper = properties[AvailableSettings.JSON_FORMAT_MAPPER] as? Jackson3JsonFormatMapper
        mapper shouldNotBe null

        val jsonString = """{"identifier":"cl_test","entries":[{"key":"1","value":"Entry 1"}]}"""
        val deserialized: JsonNode = mapper!!.fromString(jsonString, JsonNode::class.java)
        deserialized shouldNotBe null
        deserialized.get("identifier").asString() shouldBe "cl_test"
        deserialized.get("entries").size() shouldBe 1
        deserialized.get("entries")[0].get("value").asString() shouldBe "Entry 1"
    }

    @Test
    fun `DateDeserializer can be instantiated and deserializes dates correctly`() {
        val deserializer = DateDeserializer()
        deserializer.handledType() shouldBe OffsetDateTime::class.java

        val catalogJson = """{"created":"2026-08-28T14:30:00+02:00","modified":"2026-08-28T15:00:00.123456789+02:00"}"""
        val catalog = objectMapper.readValue(catalogJson, Catalog::class.java)
        catalog.created shouldNotBe null
        catalog.created shouldBe OffsetDateTime.of(2026, 8, 28, 14, 30, 0, 0, ZoneOffset.ofHours(2))
        catalog.modified shouldNotBe null
        catalog.modified shouldBe OffsetDateTime.of(2026, 8, 28, 15, 0, 0, 123456789, ZoneOffset.ofHours(2))
    }
}
