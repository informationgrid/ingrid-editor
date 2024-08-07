/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid_lfubayern

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.IngridIdfExporterLfub
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every

class LfuBayernFields : GeodatasetBase() {

    private val docSamples = mapOf(
//        "SpecializedTask" to "/export/ingrid/specialized-task.sample.maximal.json",
        "GeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
//        "Publication" to "/export/ingrid/publication.sample.maximal.json",
        "GeoService" to "/export/ingrid/geo-service.minimal.sample.json",
//        "Project" to "/export/ingrid/project.sample.maximal.json",
//        "DataCollection" to "/export/ingrid/data-collection.sample.maximal.json",
        "InformationSystem" to "/export/ingrid/information-system.maximal.sample.json"
    )

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterLfub(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
            )
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-lfubayern")
        every { codelistHandler.getCatalogCodelistValue(any(), "20000", "1") } returns "geological eins"
        every { codelistHandler.getCatalogCodelistValue(any(), "20000", "2") } returns "geological zwei"
        every { codelistHandler.getCatalogCodelistValue(any(), "20001", "1") } returns "intern eins"
        every { codelistHandler.getCatalogCodelistValue(any(), "20001", "2") } returns "intern zwei"
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("export dataSetURI, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "dataSetURI": "https://my-dataseturi.com"
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain dataSetURI
            }

            should("export supplementalInformation for GeoDataset, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "supplementalInformation": "internal comments"
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                if (docType == "GeoDataset") {
                    result shouldContain supplementalInformation
                } else {
                    result shouldNotContain "internal comments"
                }
            }

            should("export 'Interne Schlüsselwörter' for GeoDataset and GeoService, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "keywords": {
                                "internalKeywords": [
                                    {"key": "1"},
                                    {"key": "2"}
                                ]
                            }
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                if (docType == "GeoDataset" || docType == "GeoService") {
                    result shouldContain internalKeywords
                } else {
                    result shouldNotContain "intern eins"
                    result shouldNotContain "intern zwei"
                }
            }

            should("export 'Geologische Schlüsselliste' for GeoDataset and GeoService, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "keywords": {
                                "geologicalKeywords": [
                                    {"key": "1"},
                                    {"key": "2"}
                                ]
                            }
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                if (docType == "GeoDataset" || docType == "GeoService") {
                    result shouldContain geologicalKeywords
                } else {
                    result shouldNotContain "geological eins"
                    result shouldNotContain "geological zwei"
                }
            }

            should("export fees, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "fees": "It is free!"
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain fees
            }

            should("export additional use constraints comment, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "resource": {
                                "useConstraintsComments": "my comments to use constraints"
                            }
                       },""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain useConstraintComments
            }

            should("export additional use constraints comment with existing constraints, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "resource": {
                                "useConstraints": [
                                    {
                                        "title": {
                                            "key": "18"
                                        },
                                        "source": "Datenquelle: meine Quelle"
                                    }
                                ],
                                "useConstraintsComments": "my comments to use constraints"
                            }
                       },""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain useConstraintCommentsFull
            }
        }
    }
}
