package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.services.CodelistHandler
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import mockCodelists
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()

    @BeforeAll
    fun beforeAll() {
        mockCodelists(codelistService)
        every { codelistService.getCatalogCodelistKey("test", "1350", "Nieders. Abfallgesetz (NAbfG)") } returns "38"
        every { codelistService.getCatalogCodelistKey("test", "3535", "von Drachenfels 94") } returns "1"
        every { codelistService.getCatalogCodelistKey("test", "3555", "Ganzflächige Biotopkartierung 94") } returns "1"
    }

    @Test
    fun importGeoservice() {
        val isoImporter = ISOImport(codelistService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geoservice_full.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geoservice_full-expected.json")
        )
    }

    @Test
    fun importGeodataset() {
        val isoImporter = ISOImport(codelistService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geodataset_full.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geodataset_full-expected.json")
        )
    }

    private fun getFile(file: String) =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI())))
}
