/*
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
package de.ingrid.igeserver.exports.ingrid

import MockDocument
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.imports.minimalDatasetMetadata
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.BwastrLocatorService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.UploadConfig
import initDocumentMocks
import io.kotest.core.spec.Spec
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockBehaviours
import mockCatalog
import mockCodelists
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class IzgExportImportTest : ShouldSpec() {

    private val documentService = mockk<DocumentService>()
    private val behaviourService = mockk<BehaviourService>()
    private val catalogService = mockk<CatalogService>()
    private val documentWrapperRepository = mockk<DocumentWrapperRepository>(relaxed = true)
    private val codelistHandler = mockk<CodelistHandler>()
    private val uploadConfig = mockk<UploadConfig>()
    private val researchService = mockk<ResearchService>()
    private val bwastrLocatorService = mockk<BwastrLocatorService>()
    private val documentRepository = mockk<DocumentRepository>()

    private lateinit var exporter: IngridIDFExporter

    override suspend fun beforeSpec(spec: Spec) {
        clearAllMocks()
        this.exporter = IngridIDFExporter(this.codelistHandler, this.uploadConfig, this.catalogService, this.documentService, this.documentWrapperRepository)

        mockkObject(SpringContext)
        every { SpringContext.getBean(DocumentService::class.java) } answers { documentService }
        every { SpringContext.getBean(BehaviourService::class.java) } answers { behaviourService }

        mockCatalog(this.catalogService)
        mockCodelists(this.codelistHandler)
        every { codelistHandler.getCatalogCodelistValue(any(), any(), any()) } answers {
            val codelistId = secondArg<String>()
            val entryId = thirdArg<String>()
            codelistId + "_" + entryId
        }
        mockBehaviours(this.behaviourService, "plugin.ingrid.doi")
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog()
        every { catalogService.getCatalogById(any()) } returns Catalog()
        every { documentService.docRepo } returns documentRepository
        every { documentRepository.findAddressByOrganisationName(any(), any()) } returns emptyList()
        every { documentService.getWrapperByCatalogAndDocumentUuid(any(), any()) } returns DocumentWrapper()

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
        )
        val datasets = listOf(
            MockDocument(
                uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
                template = "/export/ingrid/geo-dataset.minimal.sample.json",
            ),
            MockDocument(
                uuid = "93CD0919-5A2F-4286-B731-645C34614AA1",
                template = "/export/ingrid/information-system.minimal.json",
            ),
        )
        initDocumentMocks(addresses + datasets, this.documentService)
    }

    init {
        should("export keyword izg-relevant for InGridGeoDataset when isIzg is true") {
            val context =
                jacksonObjectMapper().readTree(
                    """
                    {
                        "properties": {
                            "isIzg": true
                        }
                    }
                    """.trimIndent(),
                ) as ObjectNode

            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/geo-dataset.minimal.sample.json",
                context,
            )

            result shouldContain "<gco:CharacterString>izg-relevant</gco:CharacterString>"
        }

        should("not export keyword izg-relevant for InGridGeoDataset when isIzg is false") {
            val context =
                jacksonObjectMapper().readTree(
                    """
                    {
                        "properties": {
                            "isIzg": false
                        }
                    }
                    """.trimIndent(),
                ) as ObjectNode

            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/geo-dataset.minimal.sample.json",
                context,
            )

            result shouldNotContain "izg-relevant"
        }

        should("export keyword izg-relevant for InGridInformationSystem when isIzg is true") {
            val context =
                jacksonObjectMapper().readTree(
                    """
                    {
                        "properties": {
                            "isIzg": true
                        }
                    }
                    """.trimIndent(),
                ) as ObjectNode

            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/information-system.maximal.sample.json",
                context,
            )

            result shouldContain "<gco:CharacterString>izg-relevant</gco:CharacterString>"
        }

        should("import isIzg true when ISO metadata contains izg-relevant keyword for dataset") {
            val xml = minimalDatasetMetadata.replace(
                "</gmd:MD_DataIdentification>",
                """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword><gco:CharacterString>izg-relevant</gco:CharacterString></gmd:keyword>
                            <gmd:keyword><gco:CharacterString>FreiesSchlagwort</gco:CharacterString></gmd:keyword>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                </gmd:MD_DataIdentification>
                """.trimIndent(),
            )

            val isoImporter = ISOImport(codelistHandler, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
            val result = isoImporter.run("test", xml, mutableMapOf())
            val importedDoc = if (result.isArray) result[0] else result
            importedDoc.get("properties").get("isIzg").asBoolean() shouldBe true

            val freeKeywords = importedDoc.get("keywords").get("free")
            val freeKeywordLabels = (0 until freeKeywords.size()).map { freeKeywords[it].get("label").stringValue() }
            freeKeywordLabels shouldContain "FreiesSchlagwort"
            freeKeywordLabels shouldNotContain "izg-relevant"
        }

        should("import isIzg true when ISO metadata contains izg-relevant keyword for application") {
            val xml = minimalDatasetMetadata
                .replace("codeListValue=\"dataset\">dataset", "codeListValue=\"application\">application")
                .replace(
                    "</gmd:MD_DataIdentification>",
                    """
                        <gmd:descriptiveKeywords>
                            <gmd:MD_Keywords>
                                <gmd:keyword><gco:CharacterString>izg-relevant</gco:CharacterString></gmd:keyword>
                                <gmd:keyword><gco:CharacterString>AppSchlagwort</gco:CharacterString></gmd:keyword>
                            </gmd:MD_Keywords>
                        </gmd:descriptiveKeywords>
                    </gmd:MD_DataIdentification>
                    """.trimIndent(),
                )

            val isoImporter = ISOImport(codelistHandler, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
            val result = isoImporter.run("test", xml, mutableMapOf())
            val importedDoc = if (result.isArray) result[0] else result
            importedDoc.get("properties").get("isIzg").asBoolean() shouldBe true

            val freeKeywords = importedDoc.get("keywords").get("free")
            val freeKeywordLabels = (0 until freeKeywords.size()).map { freeKeywords[it].get("label").stringValue() }
            freeKeywordLabels shouldContain "AppSchlagwort"
            freeKeywordLabels shouldNotContain "izg-relevant"
        }
    }
}
