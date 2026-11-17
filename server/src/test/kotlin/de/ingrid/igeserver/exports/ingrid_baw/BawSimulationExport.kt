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
import io.mockk.every
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class BawSimulationExport : GeodatasetBase() {

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)

        BawPropertiesHolder.domainWhitelist = listOf("baw.de")

        this.exporter =
            IngridIdfExporterBaw(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
                this.documentWrapperRepository,
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
        should("export empty Bautechnik simulation") {
            val result = exportDocToXML(
                exporter,
                simulationDoc("""{ "simulationPhases": [ { "type": "bautechnikSimulation" } ] }"""),
            )
            result shouldContain "<baw:structuralEngineeringSimulation>"
            result shouldContain "<baw:StructuralEngineeringSimulation"
        }

        should("export empty CFD simulation") {
            val result = exportDocToXML(
                exporter,
                simulationDoc("""{ "simulationPhases": [ { "type": "cfdSimulation" } ] }"""),
            )
            result shouldContain "<baw:shipCFD>"
            result shouldContain "<baw:ShipCFD"
        }
    }
}
