/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid

import MockDocument
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import initDocumentMocks
import io.kotest.core.spec.Spec
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.string.shouldContain
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import mockCatalog
import mockCodelists

class PartialExports : ShouldSpec() {

    private val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()
    private val codelistHandler = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    private lateinit var exporter: IngridIDFExporter

    override suspend fun beforeSpec(spec: Spec) {
        clearAllMocks()
        this.exporter = IngridIDFExporter(this.codelistHandler, this.config, this.catalogService, this.documentService)

        every { codelistHandler.getCatalogCodelistValue(this.any(), this.any(), this.any()) } answers {
            val codelistId = this.secondArg<String>()
            val entryId = this.thirdArg<String>()
            when (codelistId + "_" + entryId) {
                "1350_1" -> "Baugesetzbuch (BauGB)"
                "1350_2" -> "Atomgesetz (AtG)"
                "1350_13" -> "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"
                "1350_26" -> "Umweltstatistikgesetz (Fass. 21.06.1994)"
                "111_1" -> "Provider 1"
                "111_2" -> "Provider 2"
                "6250_7" -> "Hessen"
                else -> codelistId + "_" + entryId
            }
        }
        
        mockCatalog(this.catalogService)
        mockCodelists(this.codelistHandler)

        val addresses = listOf(
            MockDocument(
                1638,
                "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
                "/export/ingrid/address.organisation.sample.json",
                type = "InGridOrganisationDoc"
            ),
            MockDocument(
                1634,
                "14a37ded-4ca5-4677-bfed-3607bed3071d",
                "/export/ingrid/address.person.sample.json",
                1638
            ),
            MockDocument(
                1652,
                "fc521f66-0f47-45fb-ae42-b14fc669942e",
                "/export/ingrid/address.person2.sample.json",
                1638
            )
        )

        val datasets = listOf(
            MockDocument(
                uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
                template = "/export/ingrid/geo-dataset.maximal.sample.json"
            ),
            MockDocument(uuid = "93CD0919-5A2F-4286-B731-645C34614AA1")
        )

        initDocumentMocks(addresses + datasets, this.documentService)
    }

    init {
        should("export URLs") {

            val context = jacksonObjectMapper().readTree(
                """{
                    "references": [{
                      "url": "https://wemove.com",
                      "type": {
                        "key": "9990"
                      },
                      "title": "test-title",
                      "explanation": "test-explanation",
                      "urlDataType": {
                        "key": null,
                        "value": "my-type"
                      }
                    }]
                    }""".trimIndent()
            ) as ObjectNode

            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/geo-service.minimal.sample.json",
                context
            )

            result shouldContain idfReferences
        }

    }
}