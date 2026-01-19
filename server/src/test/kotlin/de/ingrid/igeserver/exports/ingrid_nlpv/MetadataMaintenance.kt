/**
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
package de.ingrid.igeserver.exports.ingrid_nlpv

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_nlpv.exporter.IngridIdfExporterNLPV
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class MetadataMaintenance : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterNLPV(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-nlpv")
    }

    init {
        should("export metadataMaintenance") {
            val context =
                jacksonObjectMapper()
                    .readTree(
                        """{
                        "metadata": {
                            "maintenanceInformation": {
                                "maintenanceAndUpdateFrequency": {
                                    "key":  "7",
                                    "value": "halbj\u00E4hrlich",
                                    "_codelistId": "518"
                                },
                                "userDefinedMaintenanceFrequency": {
                                    "unit": null
                                },
                                "description": "Eine Beschreibung (maintenanceNote)"
                            }
                        }
                    }"""
                            .trimIndent(),
                    ) as ObjectNode

            val result =
                exportJsonToXML(exporter, "/export/ingrid/geo-dataset.minimal.sample.json", context, true)

            result shouldContain METADATA_MAINTENANCE
        }
    }
}
