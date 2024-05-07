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
package de.ingrid.igeserver.exports.ingrid_lubw

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.IngridIdfExporterLubw
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class LubwFields : GeodatasetBase() {

    private val docSamples = mapOf(
        "InGridGeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
    )


    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterLubw(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
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
                            }""".trimIndent()
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain oacKeyword
            }


            should("export environmentdescription to: $docType") {
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
                                        "environmentDescription": "test_environmentDescription"
                                      }
                                    }
                                  }
                                }""".trimIndent()
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain systemEnvironment
            }

        }
    }
}
