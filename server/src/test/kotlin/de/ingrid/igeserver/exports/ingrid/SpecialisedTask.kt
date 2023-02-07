package de.ingrid.igeserver.exports.ingrid

import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles(profiles = ["ingrid"])
class SpecialisedTask : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val exporter = IngridIDFExporter()

    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    // this bean must be mocked although it might not be used in this class
    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    val GENERATED_UUID_REGEX = Regex("ID_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


    @Test
    fun minimalExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJson(exporter, "/export/ingrid/specialisedTask-Document1.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialisedTask-Document1.idf.xml")
    }

}
