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

@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles(profiles = ["ingrid"])
class Geodataset : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val codelistService = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistService, config, catalogService)
        every { codelistService.getCodelistValue("100", "84", "de") } returns "CRS 84: CRS 84 / mathematisch"
        every { codelistService.getCodelistValue("100", "4230", "de") } returns "EPSG 4230: ED50 / geographisch"
        every {
            codelistService.getCodelistValue(
                "100",
                "5676",
                "de"
            )
        } returns "EPSG 5676: DHDN / Gauss-Krüger Zone 2 (E-N)"
        every { codelistService.getCodelistValue("100", "9000011", "de") } returns "DE_DHDN / GK_3_HE100"
        every { codelistService.getCodelistValue("100", "9000009", "de") } returns "DE_DHDN / GK_3_RP180"
        every { codelistService.getCodelistValue("101", "5105", "en") } returns "Baltic Sea"
        every { codelistService.getCodelistValue("101", "900007", "en") } returns "DE_DHHN85_NOH"
        every { codelistService.getCodelistValue("101", "900011", "en") } returns "Mean Sea Level"
        every { codelistService.getCodelistValue("102", "9002", "iso") } returns "Foot"
        every { codelistService.getCodelistValue("102", "9036", "iso") } returns "Kilometre"
        every { codelistService.getCodelistValue("502", "1", "iso") } returns "creation"
        every { codelistService.getCodelistValue("502", "3", "iso") } returns "revision"
        every { codelistService.getCodelistValue("505", "0", "iso") } returns "NOT_PRESENT"
        every { codelistService.getCodelistValue("505", "7", "iso") } returns "pointOfContact"
        every { codelistService.getCodelistValue("523", "4", "iso") } returns "onGoing"
        every { codelistService.getCodelistValue("523", "6", "iso") } returns "required"
        every { codelistService.getCodelistValue("6100", "105", "de") } returns "Adressen"
        every { codelistService.getCodelistValue("6100", "313", "de") } returns "Atmosphärische Bedingungen"
        every { codelistService.getCodelistValue("6100", "314", "de") } returns "Meteorologisch-geografische Kennwerte"
        every { codelistService.getCodelistValue("6250", "8", "de") } returns "Hessen"
        every { codelistService.getCodelistValue("6400", "3", "de") } returns "EDUC"
        every { codelistService.getCodelistValue("6400", "9", "de") } returns "SOCI"
        every { codelistService.getCodelistValue("8010", "1", "de") } returns "Digitale Landschaftsmodelle"
        every { codelistService.getCodelistValue("8010", "2", "de") } returns "Digitale Geländemodelle"
        every { codelistService.getCodelistValue("8010", "4", "de") } returns "3D-Gebäudemodelle"
        every { codelistService.getCodelistValue("8010", "8", "de") } returns "ALKIS"
        every { codelistService.getCodelistValue("1350", "45", "de") } returns "Gesetz über eine Holzstatistik"
        // every { codelistService.getCodelistValue(any<String>(), any<String>(), any<String>()) } answers { "getCodelistValue " + firstArg<String>() + "_" + secondArg<String>() + "_" + thirdArg<String>() }
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

        var result = exportJson(exporter, "/export/ingrid/geodataset-Document1.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document1.idf.xml")
    }

    @Test
    fun completeExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJson(exporter, "/export/ingrid/geodataset-Document2.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document2.idf.xml")
    }

}
