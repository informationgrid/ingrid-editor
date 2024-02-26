/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European
 * Commission - subsequent versions of the EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence. You may obtain a copy of the
 * Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence
 * is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the Licence for the specific language governing permissions and limitations under
 * the Licence.
 */
package de.ingrid.igeserver.exports.ingrid_up_sh

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.Geodataset
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_up_sh.exporter.IngridIdfExporterUPSH
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class GeometryContext : Geodataset() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterUPSH(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog().apply { identifier = "ingrid-up-sh" }
    }

    init {
        should("export geometry context of type 'other'") {
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{
                    "geometryContext": [{
                        "name": "test-name",
                        "dataType": "test-datatype",
                        "description": "test-description",
                        "featureType": {
                          "key": "other"
                        },
                        "geometryType": "test-geometryType",
                        "min": 3,
                        "max": 12,
                        "unit": "test-unit",
                        "attributes": [
                            {
                                "key": "1",
                                "value": "one"
                            },
                            {
                                "key": "2",
                                "value": "two"
                            }
                        ]
                      }]
                    }"""
                            .trimIndent()
                    ) as ObjectNode

            val result =
                exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain geometryContextOther
        }

        should("export geometry context of type 'nominal'") {
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{
                    "geometryContext": [{
                        "name": "test-name",
                        "dataType": "test-datatype",
                        "description": "test-description",
                        "featureType": {
                          "key": "nominal"
                        },
                        "geometryType": "test-geometryType",
                        "min": 3,
                        "max": 12,
                        "unit": "test-unit",
                        "attributes": [
                            {
                                "key": "1",
                                "value": "one"
                            },
                            {
                                "key": "2",
                                "value": "two"
                            }
                        ]
                      }]
                    }"""
                            .trimIndent()
                    ) as ObjectNode

            val result =
                exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context)

            result shouldContain geometryContextNominal
        }
    }
}
