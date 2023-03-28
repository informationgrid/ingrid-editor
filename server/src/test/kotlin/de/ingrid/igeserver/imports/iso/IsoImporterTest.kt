package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.services.CodelistHandler
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
        every { codelistService.getCodeListEntryId("102", "Metre", "iso") } returns "9001"
        every { codelistService.getCodeListEntryId("110", "Hessen", "de") } returns "8"
        every { codelistService.getCodeListEntryId("502", "creation", "iso") } returns "1"
        every { codelistService.getCodeListEntryId("505", "resourceProvider", "iso") } returns "1"
        every { codelistService.getCodeListEntryId("505", "pointOfContact", "iso") } returns "7"
        every { codelistService.getCodeListEntryId("505", "Meister", "iso") } returns null
        every { codelistService.getCodeListEntryId("510", "shiftJIS", "iso") } returns "19"
        every { codelistService.getCodeListEntryId("518", "continual", "iso") } returns "1"
        every { codelistService.getCodeListEntryId("520", "3halfInchFloppy", "iso") } returns "4"
        every { codelistService.getCodeListEntryId("523", "underDevelopment", "iso") } returns "7"
        every { codelistService.getCodeListEntryId("525", "dataset", "iso") } returns "5"
        every { codelistService.getCodeListEntryId("526", "vector", "iso") } returns "1"
        every { codelistService.getCodeListEntryId("526", "grid", "iso") } returns "2"
        every { codelistService.getCodeListEntryId("527", "climatologyMeteorologyAtmosphere", "iso") } returns "4"
        every { codelistService.getCodeListEntryId("1230", "Stunden", "de") } returns "3"
        every { codelistService.getCodeListEntryId("1320", "PNG", "de") } returns "26"
        every { codelistService.getCatalogCodelistKey("test", "1350", "Nieders. Abfallgesetz (NAbfG)") } returns "38"
        every { codelistService.getCodeListEntryId("2000", "order", "iso") } returns "5304"

        every { codelistService.getCodeListEntryId("2000", "information", "iso") } returns "5302"
        every { codelistService.getCodeListEntryId("3535", "von Drachenfels 94", "de") } returns "1"
        every { codelistService.getCodeListEntryId("3555", "Ganzflächige Biotopkartierung 94", "de") } returns "1"

        every { codelistService.getCodeListEntryId("4300", "Herr", "de") } returns "2"
        every { codelistService.getCodeListEntryId("5100", "download", "iso") } returns "3"
        every { codelistService.getCodeListEntryId("5153", "OGC:WFS 1.1.0", "iso") } returns "1"
        every { codelistService.getCodeListEntryId("5200", "infoStandingOrderService", "iso") } returns "211"
        every { codelistService.getCodeListEntryId("5200", "Unbekannt", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "Wasser", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "Adressen", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "inspireidentifiziert", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "opendata", "iso") } returns null
        every {
            codelistService.getCodeListEntryId(
                "5200",
                "Anlagen für die Bewirtschaftung von Abfällen aus der mineralgewinnenden Industrie (Bergbauabfallrichtlinie)",
                "iso"
            )
        } returns null
        every { codelistService.getCodeListEntryId("5200", "National", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "HEAL", "iso") } returns null
        every { codelistService.getCodeListEntryId("5200", "Nieders. Abfallgesetz (NAbfG)", "iso") } returns null
        every { codelistService.getCodeListEntryId("6005", "Technical Guidance for the implementation of INSPIRE Download Services", "iso") } returns null
        every { codelistService.getCodeListEntryId("6005", "VERORDNUNG (EG) Nr. 976/2009 DER KOMMISSION vom 19. Oktober 2009 zur Durchführung der Richtlinie 2007/2/EG des Europäischen Parlaments und des Rates hinsichtlich der Netzdienste", "iso") } returns "10"
        every { codelistService.getCodeListEntryId("6010", "Es gelten keine Zugriffsbeschränkungen", "de") } returns "1"
        every { codelistService.getCodeListEntryId("6100", "Adressen", null) } returns "105"
        every {
            codelistService.getCodeListEntryId(
                "6350",
                "Anlagen für die Bewirtschaftung von Abfällen aus der mineralgewinnenden Industrie (Bergbauabfallrichtlinie)",
                null
            )
        } returns "-1023933682"
        every { codelistService.getCodeListEntryId("6360", "National", null) } returns "-673152846"
        every { codelistService.getCodeListEntryId("6500", "Es gelten keine Bedingungen", "de") } returns "26"
        every { codelistService.getCodeListEntryId("6500", "BSD Lizenz", "de") } returns "20"
        every { codelistService.getCodeListEntryId("6500", "meine Lizenz", "de") } returns null
        every { codelistService.getCodeListEntryIdMatchingData("6400", "HEAL") } returns "6"
        
        every { codelistService.getCodeListEntryId("7109", "Number of duplicate feature instances", "de") } returns "2"
        every { codelistService.getCodeListEntryId("7112", "Conceptual Schema compliance", "de") } returns "2"
        every { codelistService.getCodeListEntryId("7113", "Value domain non conformance rate", "de") } returns "1"
        every { codelistService.getCodeListEntryId("7114", "Physical structure conflict rate", "de") } returns "1"
        every { codelistService.getCodeListEntryId("7115", "Number of missing connections due to undershoots", "de") } returns "2"
        every { codelistService.getCodeListEntryId("7120", "Percentage of items that are correctly events ordered", "de") } returns "1"
        every { codelistService.getCodeListEntryId("7125", "Misclassification rate", "de") } returns "1"
        every { codelistService.getCodeListEntryId("7126", "Rate of incorrect classification for national identifier", "de") } returns "2"
        every { codelistService.getCodeListEntryId("7127", "Attribute value uncertainty at 95 % significance level", "de") } returns "1"
        every { codelistService.getCodeListEntryId("7128", "mean value of positional uncertainties (3D)", "de") } returns "3"
        
        every { codelistService.getCodeListEntryId("8010", "Luftbilder", "de") } returns "6"
        every { codelistService.getCodeListEntryId("8010", "Festpunkte", "de") } returns "12"
        every { codelistService.getCodeListEntryId("8010", "Short", "de") } returns null
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
