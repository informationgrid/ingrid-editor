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
import de.ingrid.igeserver.exports.ingrid.Geodataset
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_bast.exporter.BastProfileTransformer
import de.ingrid.igeserver.profiles.ingrid_up_sh.exporter.UPSHProfileTransformer
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class BastFields : Geodataset() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter.profileTransformer["ingrid-bast"] = BastProfileTransformer()
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog().apply {
            identifier = "ingrid-bast"
        }
    }


    init {
        should("export project title and number to keywords") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "projectTitle": "BASt project title",
                    "projectNumber": "BASt project number"
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain projectTitleAndNumberInKeywords
        }
        
        should("export digitalTransferOptions with correct unit") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "digitalTransferOptions": [
                        {
                          "name": {
                            "key": "15"
                          },
                          "transferSize": {
                            "value": "123.4",
                            "unit": {
                              "key": "gb"
                            }
                          },
                          "mediumNote": "Dachboden"
                        }
                      ]
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain digitalTransferOptionWithUnit
        }

        should("export supplementalInformation") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "supplementalInformation": "Bemerkung zur BASt"
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain supplementalInformation
        }

        should("export useConstraintsComments") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "useConstraintsComments": "BASt Nutzungshinweise"
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain useConstraintsComments
        }

    }
}