/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.imports.getFile
import de.ingrid.igeserver.imports.internal.InternalImporter
import de.ingrid.igeserver.imports.internal.migrations.Migrate160
import de.ingrid.igeserver.imports.internal.migrations.Migrate170
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe

class InternalImportMigrations : AnnotationSpec() {

    @Test
    fun migrateGeodatasetFrom110ToCurrent() {
        val importer = InternalImporter()
        val json = importer.run("test", getFile("ingrid/import/internal_ingrid_110.json"), mutableMapOf())
        println(json.toString())

        json.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/internal_ingrid_110_to_current_expected.json"),
        )
        val result = SchemaUtils.validate(json.get(0).get(0).toString(), "/ingrid/schemes/geo-dataset.schema.json")
        result.size shouldBe 0
    }

    @Test
    fun testMigrate160() {
        val mapper = jacksonObjectMapper()
        val data = mapper.createObjectNode().apply {
            set<ObjectNode>(
                "spatial",
                mapper.createObjectNode().apply {
                    set<ObjectNode>(
                        "verticalExtent",
                        mapper.createObjectNode().apply {
                            put("minimumValue", 10)
                            put("maximumValue", 20)
                            set<ObjectNode>("unitOfMeasure", mapper.createObjectNode().put("key", "m"))
                            set<ObjectNode>("Datum", mapper.createObjectNode().put("key", "EPSG:5714"))
                        },
                    )
                },
            )
        }

        Migrate160.migrateSpatial(data)

        val spatial = data.get("spatial")
        val verticalExtent = spatial.get("verticalExtent")
        verticalExtent.has("Datum") shouldBe false
        verticalExtent.has("spatialSystem") shouldBe true
        verticalExtent.get("spatialSystem").get("key").asText() shouldBe "EPSG:5714"
    }

    @Test
    fun testMigrate170() {
        val mapper = jacksonObjectMapper()
        val data = mapper.createObjectNode().apply {
            putArray("processingSteps").apply {
                addObject().apply {
                    put("announcementDocsPublishDuringDisclosure", true)
                    put("applicationDocsPublishDuringDisclosure", false)
                }
                addObject().apply {
                    put("announcementDocsPublishDuringDisclosure", false)
                    put("applicationDocsPublishDuringDisclosure", false)
                    put("furtherDocsPublishDuringDisclosure", false)
                    put("reportsRecommendationDocsPublishDuringDisclosure", false)
                }
            }
        }

        val processingSteps = Migrate170.getProcessingStepsOfDocument(data)!!

        // Check if one of the target migration attributes is true.
        val step0 = processingSteps.get(0)
        step0.has("announcementDocsPublishDuringDisclosure") shouldBe false
        step0.has("applicationDocsPublishDuringDisclosure") shouldBe false
        step0.get("publishDuringDisclosure").asBoolean() shouldBe true

        // Check if all target migration attributes are false.
        val step1 = processingSteps.get(1)
        step1.has("announcementDocsPublishDuringDisclosure") shouldBe false
        step1.has("applicationDocsPublishDuringDisclosure") shouldBe false
        step1.has("furtherDocsPublishDuringDisclosure") shouldBe false
        step1.has("reportsRecommendationDocsPublishDuringDisclosure") shouldBe false
        step1.get("publishDuringDisclosure").asBoolean() shouldBe false
    }
}
