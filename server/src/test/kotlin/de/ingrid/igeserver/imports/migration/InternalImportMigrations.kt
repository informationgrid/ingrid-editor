import de.ingrid.igeserver.imports.getFile
import de.ingrid.igeserver.imports.internal.InternalImporter
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec

class InternalImportMigrations : AnnotationSpec() {

    @Test
    fun migrateGeodatasetFrom110To120() {
        val importer = InternalImporter()
        val result = importer.run("test", getFile("ingrid/import/internal_ingrid_110.json"), mutableMapOf())
        println(result.toString())

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/internal_ingrid_110_to_120_expected.json"),
        )
    }
}
