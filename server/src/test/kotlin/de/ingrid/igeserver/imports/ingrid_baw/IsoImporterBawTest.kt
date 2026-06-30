/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.imports.ingrid_baw

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.imports.changeUuidOfOrganisationTo
import de.ingrid.igeserver.imports.getFile
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid_baw.importer.ISOImportBaw
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.BwastrLocatorSearchResponse
import de.ingrid.igeserver.services.BwastrLocatorService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.mdek.upload.UploadConfig
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import mockCodelists

class IsoImporterBawTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()
    private val catalogService = mockk<CatalogService>()
    private val documentService = mockk<DocumentService>()
    private val documentRepository = mockk<DocumentRepository>()
    private val researchService = mockk<ResearchService>()
    private val uploadConfig = mockk<UploadConfig>()
    private val bwastrLocatorService = mockk<BwastrLocatorService>()

    @BeforeAll
    fun beforeAll() {
        mockCodelists(codelistService)
        every { codelistService.getCodeListEntryId("3950005", "3950005_Schlagwort1", "de") } returns "Schlagwort1"
        every { codelistService.getCodelistValue("3950005", "Schlagwort1", "de") } returns "Schlagwort1"
        every { codelistService.getCodeListEntryId("3950007", "3950007_Schlagwort2", "de") } returns "Schlagwort2"
        every { codelistService.getCodelistValue("3950007", "Schlagwort2", "de") } returns "Schlagwort2"
        every { codelistService.getCodeListEntryId("bawOrderInfo", "12345 - BAW Order Title", "de") } returns "bawOrderInfo"
        every { codelistService.getCodelistValue("bawOrderInfo", "bawOrderInfo", "de") } returns "12345 - BAW Order Title"
        every { codelistService.getCodeListEntryId("2000", "download", "iso") } returns "9900"
        every { codelistService.getCodelistValue("2000", "9900", any()) } returns "Datendownload"
        every { codelistService.getCodelistValue("99999999", "de", any()) } returns "Deutsch"
        every { codelistService.getCodeListEntryId("MD_CharacterSetCode", "utf8", "iso") } returns "utf8"
        every { codelistService.getCodelistValue("MD_CharacterSetCode", "utf8", any()) } returns "utf8"
        every { codelistService.getCatalogCodelistKey("test", "525", "dataset", "iso") } returns "5"
        every { codelistService.getCodelistValue("525", "5", "de") } returns "Datensatz"
        every { codelistService.getCodelistValue("505", "12", "de") } returns "Ansprechpartner MD"

        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-baw")
        every { catalogService.getCatalogById(any()) } returns Catalog()
        every { documentService.docRepo } returns documentRepository
        every { documentRepository.findAddressByOrganisationName(any(), any()) } returns emptyList()

        every { bwastrLocatorService.customBWASTRMap } returns emptyMap()
        every { bwastrLocatorService.search("815") } returns listOf(
            BwastrLocatorSearchResponse(
                bwastrid = "815",
                bwastr_name = "Test-Bwastr",
                strecken_name = "Test-Strecke",
                concat_name = "Test-Bwastr",
                start = 0.0,
                end = 0.0,
            ),
        )
    }

    @Test
    fun importGeodatasetBaw() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
        isoImporter.profileMapper["ingrid-baw"] = ISOImportBaw()
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geodataset_baw.xml"), mutableMapOf())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geodataset_baw-expected.json"),
        )
    }

    @Test
    fun importBawSimulation() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
        isoImporter.profileMapper["ingrid-baw"] = ISOImportBaw()
        val result = isoImporter.run("test", getFile("ingrid/import/iso_simulation_baw.xml"), mutableMapOf())
        changeUuidOfOrganisationTo(result, "BAW", "fc708688-e86a-4329-884c-8618e29037a1")

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_simulation_baw-expected.json"),
        )
    }

    @Test
    fun importBawMeasurement() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
        isoImporter.profileMapper["ingrid-baw"] = ISOImportBaw()
        val result = isoImporter.run("test", getFile("ingrid/import/iso_measurement_baw.xml"), mutableMapOf())
        changeUuidOfOrganisationTo(result, "BAW", "fc708688-e86a-4329-884c-8618e29037a1")

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_measurement_baw-expected.json"),
        )
    }
}
