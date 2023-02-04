package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.profiles.ingrid.import.ISOImport
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    @Test
    fun testRun() {
        val isoImporter = ISOImport()
        val result = isoImporter.run(xmlDoc)
        println(result.toString())
        result shouldBe ""
    }

    private val xmlDoc = String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource("csw_test_import_example.xml").toURI())))
}
