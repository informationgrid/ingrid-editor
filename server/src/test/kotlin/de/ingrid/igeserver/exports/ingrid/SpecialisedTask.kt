package de.ingrid.igeserver.exports.ingrid

import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

class SpecialisedTask : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val codelistService = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistService, config, catalogService)
        every { codelistService.getCodelistValue("100", "84", "de") } returns "CRS 84: CRS 84 / mathematisch"
        every { codelistService.getCodelistValue("100", "4230", "de") } returns "EPSG 4230: ED50 / geographisch"
        every { codelistService.getCodelistValue("100", "9000011", "de") } returns "DE_DHDN / GK_3_HE100"
        every { codelistService.getCodelistValue("101", "5105", "en") } returns "Baltic Sea"
        every { codelistService.getCodelistValue("101", "900011", "en") } returns "Mean Sea Level"
        every { codelistService.getCodelistValue("102", "9002", "iso") } returns "Foot"
        every { codelistService.getCodelistValue("102", "9036", "iso") } returns "Kilometre"
        every { codelistService.getCodelistValue("502", "1", "iso") } returns "creation"
        every { codelistService.getCodelistValue("502", "3", "iso") } returns "revision"
        every { codelistService.getCodelistValue("505", "7", "iso") } returns "replace2"
        every { codelistService.getCodelistValue("518", "1", "iso") } returns "continual"
        every { codelistService.getCodelistValue("523", "4", "iso") } returns "onGoing"
        every { codelistService.getCodelistValue("6100", "105", "de") } returns "Adressen"
        every { codelistService.getCodelistValue("6100", "313", "de") } returns "Atmosphärische Bedingungen"
        every { codelistService.getCodelistValue("6250", "8", "de") } returns "Hessen"
        every { codelistService.getCodelistValue("8010", "1", "de") } returns "Digitale Landschaftsmodelle"
        every { codelistService.getCodelistValue("8010", "2", "de") } returns "Digitale Geländemodelle"
        every { codelistService.getCodelistValue("1230", "5", "de") } returns "Monate"
        every { codelistService.getCodelistValue("1350", "45", "de") } returns "Gesetz über eine Holzstatistik"
    }

    private lateinit var exporter: IngridIDFExporter


    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    // this bean must be mocked although it might not be used in this class
    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    val GENERATED_UUID_REGEX = Regex("ID_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


    @Test
    fun minimalExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToXML(exporter, "/export/ingrid/specialisedTask-Document1.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialisedTask-Document1.idf.xml")
    }

    @Test
    fun completeExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToXML(exporter, "/export/ingrid/specialisedTask-Document2.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/specialisedTask-Document2.idf.xml")
    }

}
