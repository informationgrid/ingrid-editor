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
package de.ingrid.igeserver.exports.ingrid_baw

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.BawPropertiesHolder
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.IngridIdfExporterBaw
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class BawFields : GeodatasetBase() {

    private val docSamples = mapOf(
        "GeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
        "GeoService" to "/export/ingrid/geo-service.minimal.sample.json",
        "Project" to "/export/ingrid/project.sample.maximal.json",
        "Software" to "/export/ingrid/information-system.maximal.sample.json",
        // "Publication" to "/export/ingrid/publication.sample.maximal.json",
    )

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)

        // URL transformation whitelist for BAW
        BawPropertiesHolder.domainWhitelist = listOf("baw.de")

        this.exporter =
            IngridIdfExporterBaw(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-baw")

        // BAW exporter needs these mocks
        every { documentService.getWrapperById(any()) } returns DocumentWrapper().apply {
            id = 123
            uuid = "mocked-uuid"
            type = "InGridGeoDataset"
        }

        every { documentService.findChildren(any(), any(), any(), any()) } returns FindAllResults(0, emptyList())
        every { documentService.getLastPublishedDocument(any(), any(), any()) } returns Document()
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("export bawKeywords for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "keywords": {
                            "bawKeywords": [
                                { "key": "Schlagwort1" }
                            ]
                        }
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain BAW_KEYWORDS
            }
            should("export subsoilKeywords for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "keywords": {
                            "subsoilKeywords": [
                                { "key": "Schlagwort2" }
                            ]
                        }
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain SUBSOIL_KEYWORDS
            }

            should("export bwastr spatial references for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "spatial": {
                            "references": [
                                {
                                    "type": "bwastr",
                                    "title": "Test Bwstr",
                                    "bwastr": {
                                        "bwastrid": "0815",
                                        "bwastr_name": "Test Bwstr",
                                        "strecken_name": "Test Strecke",
                                        "start": 10.5,
                                        "end": 20.0
                                    }
                                }
                            ]
                        }
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain BWASTR_ADDITIONAL_FIELDS
                result shouldContain "0815-10.5-20"
            }

            should("export lfsReferences with KA prefix for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "lfsReferences": [
                            {
                                "title": "LFS Download",
                                "explanation": "LFS Explanation",
                                "file": {
                                    "uuid": "KA/test-file.pdf"
                                }
                            }
                        ]
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain "https://dl.datenfinder.baw.de/LFS/KA/test-file.pdf"
                result shouldContain "LFS Download"
                result shouldContain "LFS Explanation"
                result shouldContain LFS_REFERENCE
            }

            should("export lfsReferences without prefix for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "lfsReferences": [
                            {
                                "title": "LFS Download",
                                "explanation": "LFS Explanation",
                                "file": {
                                    "uuid": "test-file.pdf"
                                }
                            }
                        ]
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain "https://dl.datenfinder.baw.de/test-file.pdf"
            }

            should("export lfsReferences without prefix for KA- without slash: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "lfsReferences": [
                            {
                                "title": "LFS Download",
                                "explanation": "LFS Explanation",
                                "file": {
                                    "uuid": "KA-test-file.pdf"
                                }
                            }
                        ]
                    }"""
                                .trimIndent(),
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain "https://dl.datenfinder.baw.de/KA-test-file.pdf"
            }
        }

        should("export literature references for GeoDataset") {
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{
                        "literatureReferences": [
                            { "uuid": "lit-uuid-1" }
                        ]
                    }"""
                            .trimIndent(),
                    ) as ObjectNode

            val litDoc = Document().apply {
                uuid = "lit-uuid-1"
                title = "Test Literature Title"
                catalog = Catalog().apply {
                    identifier = "test-catalog"
                    type = "ingrid-baw"
                }
                data = jacksonObjectMapper().createObjectNode()
            }

            every { documentService.getLastPublishedDocument("test-catalog", "lit-uuid-1", any()) } returns litDoc

            val result =
                exportJsonToXML(exporter, docSamples["GeoDataset"]!!, context)

            result shouldContain "Test Literature Title"
        }

        should("export bawOrderInfo for GeoDataset") {
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{
                        "bawOrderInfo": { "key": "12345 - BAW Order Title" }
                    }"""
                            .trimIndent(),
                    ) as ObjectNode

            // Mock codelist for bawOrderInfo
            every { codelistHandler.getCatalogCodelistValue(any(), "bawOrderInfo", any()) } returns "12345 - BAW Order Title"

            val result =
                exportJsonToXML(exporter, docSamples["GeoDataset"]!!, context)

            result shouldContain "<gco:CharacterString>BAW Order Title</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>12345</gco:CharacterString>"
            result shouldContain BAW_ORDER_INFO
        }
    }
}
