/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid_bast

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_bast.exporter.IngridIdfExporterExternalBast
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every

class BastFieldsExternal : GeodatasetBase() {

    private val docSamples = mapOf(
        "GeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
        "GeoService" to "/export/ingrid/geo-service.minimal.sample.json",
        "DataCollection" to "/export/ingrid/data-collection.sample.maximal.json"
    )

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterExternalBast(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
                DummyCatalog("ingrid-bast")
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("not export project title and number to keywords for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                    "projectTitle": "BASt project title",
                    "projectNumber": "BASt project number"
                    }"""
                                .trimIndent()
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldNotContain projectTitleAndNumberInKeywords
            }

            should("not export digitalTransferOptions with correct unit for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                    "digitalTransferOptions": [
                        {
                          "name": {
                            "key": "15"
                          },
                          "transferSize": {
                            "value": "123.4",
                            "unit": {
                              "key": "GB"
                            }
                          },
                          "mediumNote": "Dachboden"
                        }
                      ]
                    }"""
                                .trimIndent()
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldNotContain digitalTransferOptionWithUnit
            }

            should("not export supplementalInformation for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                    "supplementalInformation": "Bemerkung zur BASt"
                    }"""
                                .trimIndent()
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldNotContain supplementalInformation
            }

            should("export useConstraintsComments for: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                        "resource": {
                            "useConstraintsComments": "BASt Nutzungshinweise"
                        }
                    }"""
                                .trimIndent()
                        ) as ObjectNode

                val result =
                    exportJsonToXML(exporter, docSample, context)

                result shouldContain useConstraintsComments
            }
        }
    }
}
