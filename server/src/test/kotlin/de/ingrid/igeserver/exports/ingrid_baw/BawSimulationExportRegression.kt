/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportDocToXML
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.BawPropertiesHolder
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.IngridIdfExporterBaw
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class BawSimulationExportRegression : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)

        BawPropertiesHolder.domainWhitelist = listOf("baw.de")
        exporter = IngridIdfExporterBaw(
            codelistHandler,
            uploadConfig,
            catalogService,
            documentService,
            documentWrapperRepository,
        )
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-baw")
        every { documentService.getWrapperById(any()) } returns DocumentWrapper().apply {
            id = 123
            uuid = "mocked-uuid"
            type = "BawSimulation"
        }
        every { documentService.findChildren(any(), any(), any(), any()) } returns FindAllResults(0, emptyList())
        every { documentService.getLastPublishedDocument(any(), any(), any()) } returns Document()
    }

    private fun simulationDoc(additional: String): Document {
        val doc = convertToDocument(SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.sample.json"))
        doc.type = "BawSimulation"
        doc.data.setAll(jacksonObjectMapper().readTree(additional) as ObjectNode)
        doc.catalog = Catalog().apply { identifier = "test-catalog" }
        return doc
    }

    init {
        should("export structural engineering simulation code-list values") {
            every {
                codelistHandler.getCodelistValue("BAW_simulationSoftware", "1", any())
            } returns "Resolved software"
            every {
                codelistHandler.getCodelistValue("BAW_simulationSpatialDimension", "2", any())
            } returns "Resolved dimension"
            every {
                codelistHandler.getCodelistValue("BAW_simulationConcreteUnit", "3", any())
            } returns "Resolved unit"
            every {
                codelistHandler.getCatalogCodelistValue(any(), "BAW_simulationSoftware", "1", any())
            } returns "Resolved software"
            every {
                codelistHandler.getCatalogCodelistValue(any(), "BAW_simulationSpatialDimension", "2", any())
            } returns "Resolved dimension"
            every {
                codelistHandler.getCatalogCodelistValue(any(), "BAW_simulationConcreteUnit", "3", any())
            } returns "Resolved unit"

            val result = exportDocToXML(
                exporter,
                simulationDoc(
                    """{
                        "simulationPhases": [{
                            "type": "bautechnikSimulation",
                            "software": {
                                "name": { "key": "1", "value": "Entered software", "_codelistId": "BAW_simulationSoftware" },
                                "version": "4.2"
                            },
                            "dimension": {
                                "spatialDimension": { "key": "2", "value": "Entered dimension", "_codelistId": "BAW_simulationSpatialDimension" }
                            },
                            "materialParameters": {
                                "concrete": [{
                                    "compressiveStrength": 42.5,
                                    "unitOfMeasure": { "key": "3", "value": "Entered unit", "_codelistId": "BAW_simulationConcreteUnit" }
                                }]
                            }
                        }]
                    }""",
                ),
            )

            result shouldContain "Resolved software"
            result shouldContain "4.2"
            result shouldContain "Resolved dimension"
            result shouldContain "Resolved unit"
        }

        should("export CFD simulation values, properties, and cell count") {
            val result = exportDocToXML(
                exporter,
                simulationDoc(
                    """{
                        "simulationPhases": [{
                            "type": "cfdSimulation",
                            "shipName": [
                                { "key": "1", "value": "PPM42", "_codelistId": "BAW_shipName" },
                                { "key": null, "value": "Custom vessel", "_codelistId": "BAW_shipName" }
                            ],
                            "physics": { "key": "2", "value": "LevelSet", "_codelistId": "BAW_physics" },
                            "properties": {
                                "constantCrossSection": true,
                                "propulsion": false
                            },
                            "movementType": { "key": "1", "value": "DFBIMorphing", "_codelistId": "BAW_movementType" },
                            "trajectory": { "key": "3", "value": "ZigZag", "_codelistId": "BAW_trajectory" },
                            "cellCount": 142
                        }]
                    }""",
                ),
            )

            result shouldContain "PPM42"
            result shouldContain "Custom vessel"
            result shouldContain "LevelSet"
            result shouldContain "<gco:Boolean>true</gco:Boolean>"
            result shouldContain "<gco:Boolean>false</gco:Boolean>"
            result shouldContain "DFBIMorphing"
            result shouldContain "ZigZag"
            result shouldContain "<gco:Integer>142</gco:Integer>"
        }

        should("omit empty optional simulation values") {
            val result = exportDocToXML(
                exporter,
                simulationDoc(
                    """{ "simulationPhases": [{ "type": "cfdSimulation" }, { "type": "bautechnikSimulation" }] }""",
                ),
            )

            result shouldNotContain "<baw:statementAboutPhysics>"
            result shouldNotContain "<baw:constantCrossSection>"
            result shouldNotContain "<baw:cellCount>"
            result shouldNotContain "<baw:softwareName>"
            result shouldNotContain "<baw:spatialDimensionality>"
        }
    }
}
