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
package de.ingrid.igeserver.exports.ingrid

import MockDocument
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.Config
import initDocumentMocks
import io.kotest.core.spec.Spec
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockCatalog
import mockCodelists

class SpecialisedTask : ShouldSpec() {

    private val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()

    private val codelistHandler = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    private lateinit var exporter: IngridIDFExporter

    override suspend fun beforeSpec(spec: Spec) {
        clearAllMocks()
        this.exporter = IngridIDFExporter(codelistHandler, config, catalogService, documentService)

        mockkObject(SpringContext)
        every { SpringContext.getBean(DocumentService::class.java) } answers {
            documentService
        }

        every { codelistHandler.getCatalogCodelistValue(any(), any(), any()) } answers {
            val codelistId = secondArg<String>()
            val entryId = thirdArg<String>()
            when (codelistId + "_" + entryId) {
                "1350_1" -> "Baugesetzbuch (BauGB)"
                "1350_2" -> "Atomgesetz (AtG)"
                "111_1" -> "Provider 1"
                "111_2" -> "Provider 2"
                "6250_7" -> "Hessen"
                "1350_3" -> "Bürgerl. Gesetzbuch (BGB)"
                "1350_31" -> "TA Abfall"
                "1350_42" -> "Landesraumordnungsprogramm LROP"
                "1350_45" -> "Gesetz über eine Holzstatistik"
                "1350_58" -> "§ 152 NWG (Abwasserbeseitigungspläne)"
                "1350_61" -> "23. Bundesimmissionsschutzverordnung"
                "1350_62" -> "Abfallgesetz (AbfG)"
                "1350_63" -> "AdV-Plenumsbeschluß von 1994"
                else -> codelistId + "_" + entryId
            }
        }

        mockCatalog(catalogService)
        mockCodelists(codelistHandler)

        val addresses = listOf(
            MockDocument(
                1638,
                "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
                "/export/ingrid/address.organisation.sample.json",
                type = "InGridOrganisationDoc",
            ),
            MockDocument(
                1634,
                "14a37ded-4ca5-4677-bfed-3607bed3071d",
                "/export/ingrid/address.person.sample.json",
                1638,
            ),
            MockDocument(
                1652,
                "fc521f66-0f47-45fb-ae42-b14fc669942e",
                "/export/ingrid/address.person2.sample.json",
                1638,
            ),
            MockDocument(
                12331,
                "107d5e76-2df1-4c0e-8af6-c57ad13bfe9a",
                "/export/ingrid/address.organisation-12331.sample.json",
            ),
            MockDocument(
                5,
                "9931a418-a159-4d6e-9b94-f041e3957b24",
                "/export/ingrid/address.organisation-5.sample.json",
            ),
        )

        val datasets = listOf(
            MockDocument(
                uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
                template = "/export/ingrid/geo-dataset.maximal.sample.json",
            ),
            MockDocument(uuid = "93CD0919-5A2F-4286-B731-645C34614AA1"),
//            MockDocument(5, "generalMockedDoc"),
            MockDocument(1700, "Übergeordneter Identifikator"),
        )

        initDocumentMocks(addresses + datasets, documentService)
    }

    init {

        should("minimalExport") {
            var result = exportJsonToXML(exporter, "/export/ingrid/specialisedTask-Document1.json")
            // replace generated UUIDs and windows line endings
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialisedTask-Document1.idf.xml")
        }

        should("maximalExport") {
            var result = exportJsonToXML(exporter, "/export/ingrid/specialized-task.sample.maximal.json")
            // replace generated UUIDs and windows line endings
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialized-task.expected.maximal.idf.xml")
        }

        should("completeExport") {
            var result = exportJsonToXML(exporter, "/export/ingrid/specialisedTask-Document2.json")
            // replace generated UUIDs and windows line endings
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialisedTask-Document2.idf.xml")
        }
    }
}
