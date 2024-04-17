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
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.IngridIdfExporterExternalLfub
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every

class LfuBayernFieldsExternal : GeodatasetBase() {

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
            IngridIdfExporterExternalLfub(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
                DummyCatalog().apply { identifier = "ingrid-lfubayern" }
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("export no dataSetURI, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "dataSetURI": "https://my-dataseturi.com"
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldNotContain "https://my-dataseturi.com"
            }
            
            should("export no supplementalInformation, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "supplementalInformation": "internal comments"
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldNotContain "internal comments"
            }
            
            should("export no 'Interne Schlüsselwörter', testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "keywords": {
                                "internalKeywords": [
                                    "intern eins",
                                    "intern zwei"
                                ]
                            }
                        }""".trimIndent()
                ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldNotContain "intern eins"
                result shouldNotContain "intern zwei"
            }
            
            should("export 'Geologische Schlüsselliste' for GeoDataset and GeoService, testing: $docType") {
                val context = jacksonObjectMapper().readTree(
                    """{
                            "keywords": {
                                "geologicalKeywords": [
                                    "geological eins",
                                    "geological zwei"
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
                                        "source": "meine Quelle"
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
