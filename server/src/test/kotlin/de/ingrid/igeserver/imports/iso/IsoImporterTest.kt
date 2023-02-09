package de.ingrid.igeserver.imports.iso

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.services.CodelistHandler
import io.kotest.assertions.json.FieldComparison
import io.kotest.assertions.json.compareJsonOptions
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()

    @BeforeAll
    fun beforeAll() {
        every { codelistService.getCodeListEntryId("100", "EPSG 3068: DHDN / Soldner Berlin", "de") } returns "3068"
        every { codelistService.getCodeListEntryId("101", "DE_AMST / NH", "de") } returns "900002"
        every { codelistService.getCodeListEntryId("102", "Metre", "ISO") } returns "9001"
        every { codelistService.getCodeListEntryId("502", "creation", "ISO") } returns "1"
        every { codelistService.getCodeListEntryId("505", "pointOfContact", "ISO") } returns "7"
        every { codelistService.getCodeListEntryId("518", "continual", "ISO") } returns "1"
        every { codelistService.getCodeListEntryId("523", "underDevelopment", "ISO") } returns "7"
        every { codelistService.getCodeListEntryId("1230", "Stunden", "de") } returns "3"
        every { codelistService.getCodeListEntryId("1350", "Nieders. Abfallgesetz (NAbfG)", "de") } returns "38"
        every { codelistService.getCodeListEntryId("5100", "download", "ISO") } returns "3"
        every { codelistService.getCodeListEntryId("5153", "OGC:WFS 1.1.0", "ISO") } returns "1"
        every { codelistService.getCodeListEntryId("6010", "Es gelten keine Zugriffsbeschränkungen", "de") } returns "1"
        every { codelistService.getCodeListEntryId("6100", "Adressen", null) } returns "105"
        every { codelistService.getCodeListEntryId("6350", "Anlagen für die Bewirtschaftung von Abfällen aus der mineralgewinnenden Industrie (Bergbauabfallrichtlinie)", null) } returns "-1023933682"
        every { codelistService.getCodeListEntryId("6360", "National", null) } returns "-673152846"
        every { codelistService.getCodeListEntryIdMatchingData("6400", "HEAL") } returns "6"
        every { codelistService.getCodeListEntryId("8010", "Luftbilder", "de") } returns "6"
        every { codelistService.getCodeListEntryId("8010", "Festpunkte", "de") } returns "12"
        every { codelistService.getCodeListEntryId("8010", "Short", "de") } returns null
    }

    @Test
    fun testRun() {
        val isoImporter = ISOImport(codelistService)
        val result = isoImporter.run(getFile("ingrid/import/iso_geoservice_full.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geoservice_full-expected.json"),
            compareJsonOptions { fieldComparison = FieldComparison.Lenient })
    }

    private fun getFile(file: String) =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI())))
}
