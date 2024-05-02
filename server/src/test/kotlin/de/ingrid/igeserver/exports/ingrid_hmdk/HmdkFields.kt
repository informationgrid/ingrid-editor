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
package de.ingrid.igeserver.exports.ingrid_hmdk

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_hmdk.exporter.IngridIdfExporterHmdk
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class HmdkFields : GeodatasetBase() {

    private val docSamples = mapOf(
        "InGridGeoDataset" to "/export/ingrid/geo-dataset.minimal.sample.json",
        "InGridGeoService" to "/export/ingrid/geo-service.minimal.sample.json",
        "InGridDataCollection" to "/export/ingrid/data-collection.sample.maximal.json",
        "InGridInformationSystem" to "/export/ingrid/information-system.maximal.sample.json",
        "InGridPublication" to "/export/ingrid/publication.sample.maximal.json",
        "InGridProject" to "/export/ingrid/project.sample.maximal.json",
    )


    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterHmdk(
                this.codelistHandler,
                this.config,
                this.catalogService,
                this.documentService
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
                DummyCatalog("ingrid-hmdk")
    }

    init {
        docSamples.forEach { (docType, docSample) ->
            should("export hmbtg keyword to: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                            "publicationHmbTG": true
                            }""".trimIndent()
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain hmbtgKeyword
            }


            should("export informationsgegenstand to: $docType") {
                val context =
                    jacksonObjectMapper()
                        .readTree(
                            """{
                             "informationHmbTG": [
                                {
                                  "key": "hmbtg_02_mitteilung_buergerschaft"
                                }
                              ]
                            }""".trimIndent()
                        ) as ObjectNode

                val result = exportJsonToXML(exporter, docSample, context)
                result shouldContain informationsgegenstandISO
            }

        }
    }
}
