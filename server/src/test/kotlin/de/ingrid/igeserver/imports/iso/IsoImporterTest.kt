package de.ingrid.igeserver.imports.iso

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import io.kotest.assertions.json.FieldComparison
import io.kotest.assertions.json.compareJsonOptions
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    private val codelistService = mockk<CodeListService>()

    @BeforeAll
    fun beforeAll() {
        every { codelistService.getCodeListEntryId("505", "pointOfContact", "ISO") } returns "7"
        every { codelistService.getCodeListEntryId("8010", "Luftbilder", "de") } returns "6"
        every { codelistService.getCodeListEntryId("8010", "Festpunkte", "de") } returns "12"
        every { codelistService.getCodeListEntryId("8010", "Mein alternativer Titel", "de") } returns null
    }

    @Test
    fun testRun() {
        val isoImporter = ISOImport(codelistService)
        val result = isoImporter.run(getFile("ingrid/import/csw_test_import_example.xml"))
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/csw_test_import_example-expected.json"),
            compareJsonOptions { fieldComparison = FieldComparison.Lenient })
    }

    private fun getFile(file: String) =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI())))
}
