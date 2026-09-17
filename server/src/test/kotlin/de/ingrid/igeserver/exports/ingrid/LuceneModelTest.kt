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
package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.*
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import tools.jackson.module.kotlin.jacksonObjectMapper

class LuceneModelTest : GeodatasetBase() {

    private lateinit var luceneExporter: IngridLuceneExporter

    override suspend fun beforeSpec(spec: io.kotest.core.spec.Spec) {
        super.beforeSpec(spec)
        this.luceneExporter = IngridLuceneExporter(
            this.codelistHandler,
            this.uploadConfig,
            this.catalogService,
            this.documentService,
        )
    }

    init {
        should("serialize LuceneDocument to valid JSON with Jackson") {
            val doc = LuceneDocument(
                id = "test-uuid-1234",
                metadata = LuceneMetadata(
                    dataType = "INGRID",
                    created = "2026-09-15T12:00:00.000Z",
                    modified = "2026-09-15T12:00:00.000Z",
                    partner = "bb",
                    provider = "test_provider",
                    language = "ger",
                    datasource = LuceneDatasource(
                        id = "test-catalog",
                        name = "Test Catalog",
                    ),
                ),
                title = "Test Dataset Title",
                description = "Test dataset description",
                spatials = listOf(
                    LuceneSpatial(
                        name = "Test Polygon",
                        bbox = listOf(10.0, 50.0, 11.0, 51.0),
                        geometry = """{"type":"Polygon","coordinates":[[[10,50],[10,51],[11,51],[11,50],[10,50]]]}""",
                    ),
                ),
                temporal = LuceneTemporal(
                    dataTemporal = listOf(
                        LuceneDataTemporal(
                            dateType = "created",
                            date = "2026-09-15T12:00:00Z",
                        ),
                    ),
                    status = LuceneKeyValue("1", "abgeschlossen"),
                ),
                keywords = listOf(
                    LuceneKeyword(
                        term = "Umwelt",
                        id = "123",
                        source = "gemet",
                    ),
                ),
                contacts = listOf(
                    LuceneContact(
                        role = "pointOfContact",
                        name = "Test Contact",
                        communications = listOf(
                            LuceneCommunication(type = "email", value = "test@example.com"),
                        ),
                        locality = "Berlin",
                        country = "DEU",
                        administrativeArea = "Berlin",
                    ),
                ),
                ingrid = LuceneIngrid(
                    alternateTitle = "Alt Title",
                    references = emptyList(),
                    licenses = emptyList(),
                    parentIdentifier = null,
                    datasourceIdentifier = "https://example.com/dataset/123",
                    specificUsage = "Testing",
                    purpose = "Unit Testing",
                    orderInfo = null,
                ),
            )

            val mapper = jacksonObjectMapper()
            val json = mapper.writeValueAsString(doc)

            json shouldContain "\"${'$'}schema\":\"https://schema.ingrid-oss.eu/index/draft/index-ingrid.html\""
            json shouldContain """"data_type":"INGRID""""
            json shouldContain """"type":"Polygon""""
            json shouldContain """"term":"Umwelt""""
        }

        should("export geo-dataset using Jackson-based IngridLuceneExporter") {
            val input = SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.sample.json")
            val doc = convertToDocument(input)
            val result = (luceneExporter.run(doc, "test-catalog", ExportOptions(includeDraft = false)) as String)
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldContain "\"${'$'}schema\":\"https://schema.ingrid-oss.eu/index/draft/index-ingrid.html\""
            result shouldContain """"data_type":"INGRID""""
            result shouldContain """"title":"Test-Datensatz Minimal""""
        }
    }
}
