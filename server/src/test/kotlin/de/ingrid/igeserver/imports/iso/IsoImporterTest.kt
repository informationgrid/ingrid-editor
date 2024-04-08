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
package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import mockCodelists
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()
    private val catalogService = mockk<CatalogService>()
    private val documentService = mockk<DocumentService>()
    private val documentRepository = mockk<DocumentRepository>()

    @BeforeAll
    fun beforeAll() {
        mockCodelists(codelistService)
        every { codelistService.getCatalogCodelistKey("test", "1350", "Nieders. Abfallgesetz (NAbfG)") } returns "38"
        every { codelistService.getCatalogCodelistKey("test", "3535", "von Drachenfels 94") } returns "1"
        every { codelistService.getCatalogCodelistKey("test", "3555", "Ganzflächige Biotopkartierung 94") } returns "1"
        every { codelistService.getCatalogCodelistKey("test", "6250", "Hessen") } returns "7"
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog()
        every { documentService.docRepo } returns documentRepository
        every { documentRepository.findAddressByOrganisationName(any()) } returns null
    }

    @Test
    fun importGeoservice() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geoservice_full.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geoservice_full-expected.json")
        )
    }

    @Test
    fun importGeodataset() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geodataset_full.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geodataset_full-expected.json")
        )
    }
    
    /*@Test
    fun importAddressHierarchy() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)
        val result = isoImporter.run("test", getFile("ingrid/import/e2ed7da0-007a-11e0-be74-0000779eba3a.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geodataset_full-expected.json")
        )
    }*/

    private fun getFile(file: String) =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI())))
}
