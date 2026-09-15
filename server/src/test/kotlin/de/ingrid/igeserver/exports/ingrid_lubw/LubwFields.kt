/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid_lubw

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.IngridIdfExporterLubw
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class LubwFields : GeodatasetBase() {

    private val docSamples = mapOf(
        "InGridGeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
    )

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterLubw(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-lubw")
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("export oac keyword to: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                            "oac": "test_oac"
                            }
                            """.trimIndent(),
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain OAC_KEYWORD
            }

            should("export environmentdescription to: $docType") {
                every {
                    super.codelistHandler.getCatalogCodelistValue(
                        this.any(),
                        "30001",
                        "1",
                    )
                } returns "test_environmentDescription"
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{"dataQualityInfo": {
                                    "lineage": {
                                      "source": {
                                        "descriptions": [],
                                        "processStep": {
                                          "description": []
                                        },
                                        "environmentDescription": { "key": "1", "value": "test_environmentDescription", "_codelistId": "30001"}
                                      }
                                    }
                                  }
                                }
                            """.trimIndent(),
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain SYSTEM_ENVIRONMENT
            }
        }
        should("export objectAttributes") {
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30002", "11")
            } returns "Bewertung"
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30002", "19")
            } returns "Berichte"
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30003", "1")
            } returns "Angebotsdaten"
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30003", "3")
            } returns "Pflichtdaten Test"
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30004", "0")
            } returns "0 - Open Data"
            every {
                super.codelistHandler.getCatalogCodelistValue(this.any(), "30004", "1")
            } returns "1 - unbeschränkt (im Internet)"
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{ 
                          "featureCatalogueDescription": {
                            "objectAttributes": [
                              {
                                "group": {
                                  "key": "47",
                                  "value": "Allgemeine Daten",
                                  "_codelistId": "30002"
                                },
                                "category": {
                                  "key": "1",
                                  "value": "Angebotsdaten",
                                  "_codelistId": "30003"
                                },
                                "description": "Testbeschreibung",
                                "designation": "Test 1",
                                "transmissionLevel": {
                                  "key": "3",
                                  "value": "3 - beschränkt auf alle Partner des SKDV-Datenverbund pauschal ohne Vorprüfung",
                                  "_codelistId": "30004"
                                }
                              },
                              {
                                "group": {
                                  "key": "19",
                                  "value": "Berichte",
                                  "_codelistId": "30002"
                                },
                                "category": {
                                  "key": "3",
                                  "value": "Pflichtdaten",
                                  "_codelistId": "30003"
                                },
                                "description": "Beschreibung Zwei",
                                "designation": "Test 2",
                                "transmissionLevel": {
                                  "key": "1",
                                  "value": "1 - unbeschränkt (im Internet)",
                                  "_codelistId": "30004"
                                }
                              },
                              {
                                "group": {
                                  "key": "11",
                                  "value": "Bewertung",
                                  "_codelistId": "30002"
                                },
                                "designation": "Open 1",
                                "description": "Beschreibung 3",
                                "category": {
                                  "key": "1",
                                  "value": "Angebotsdaten",
                                  "_codelistId": "30003"
                                },
                                "transmissionLevel": {
                                  "key": "0",
                                  "value": "0 - Open Data",
                                  "_codelistId": "30004"
                                }
                              }
                            ]
                          }
                        }
                        """.trimIndent(),
                    ) as ObjectNode

            val result = exportJsonToXML(exporter, docSamples["InGridGeoDataset"]!!, context)
            result shouldContain OBJECT_ATTRIBUTES
        }
    }
}
