package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.assertions.json.shouldMatchJson
import io.kotest.core.spec.style.AnnotationSpec
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    @Test
    fun testRun() {
        val isoImporter = ISOImport()
        val result = isoImporter.run(xmlDoc)
        println(result.toString())
        result.toPrettyString() shouldEqualJson """{ 
            "title": "xxx", 
            "_uuid": "1234567",
            "_parent": null,
            "_type": "InGridGeoService",
            "description": "abc"
         }"""
    }

    private val xmlDoc =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource("csw_test_import_example.xml").toURI())))
}
