package igeserver.imports.iso

import de.ingrid.igeserver.imports.iso.IsoImporter
import io.kotest.core.spec.style.AnnotationSpec
import java.io.IOException
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest: AnnotationSpec() {
    
    @Test
    fun testRun() {
        val isoImporter = IsoImporter()
        val data = xmlDoc
        isoImporter.run(data!!)
    }

    // TODO Auto-generated catch block
    private val xmlDoc: String?
        private get() = try {
            String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource("csw_test_import_example.xml").toURI())))
        } catch (e: IOException) {
            // TODO Auto-generated catch block
            e.printStackTrace()
            null
        } catch (e: URISyntaxException) {
            e.printStackTrace()
            null
        }
}
