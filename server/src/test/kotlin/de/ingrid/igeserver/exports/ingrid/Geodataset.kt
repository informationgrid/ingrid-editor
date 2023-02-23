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

//@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles(profiles = ["ingrid"])
class Geodataset : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val codelistService = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistService, config, catalogService)

        every { codelistService.getCodelistValue(any<String>(), any<String>(), any<String>()) } answers {
            when (firstArg<String>() + "_" + secondArg<String>() + "_" + thirdArg<String>()) {
                "100_84_de" -> "CRS 84: CRS 84 / mathematisch"
                "100_4230_de" -> "EPSG 4230: ED50 / geographisch"
                "100_5676_de" -> "EPSG 5676: DHDN / Gauss-Krüger Zone 2 (E-N)"
                "100_9000011_de" -> "DE_DHDN / GK_3_HE100"
                "100_9000009_de" -> "DE_DHDN / GK_3_RP180"
                "101_5105_en" -> "Baltic Sea"
                "101_900007_en" -> "DE_DHHN85_NOH"
                "101_900011_en" -> "Mean Sea Level"
                "102_9002_iso" -> "Foot"
                "102_9036_iso" -> "Kilometre"
                "502_1_iso" -> "creation"
                "502_3_iso" -> "revision"
                "505_0_iso" -> "NOT_PRESENT"
                "505_7_iso" -> "pointOfContact"
                "509_2_iso" -> "area"
                "514_2_iso" -> "column"
                "514_5_iso" -> "crossTrack"
                "518_1_iso" -> "continual"
                "523_4_iso" -> "onGoing"
                "523_6_iso" -> "required"
                "1230_5_de" -> "Monate"
                "6100_105_de" -> "Adressen"
                "6100_313_de" -> "Atmosphärische Bedingungen"
                "6100_314_de" -> "Meteorologisch-geografische Kennwerte"
                "6250_8_de" -> "Hessen"
                "6400_3_de" -> "EDUC"
                "6400_9_de" -> "SOCI"
                "6500_25_de" -> "Datenlizenz Deutschland – Zero – Version 2.0"
                "6500_26_de" -> "Es gelten keine Bedingungen"
                "8010_1_de" -> "Digitale Landschaftsmodelle"
                "8010_2_de" -> "Digitale Geländemodelle"
                "8010_4_de" -> "3D-Gebäudemodelle"
                "8010_8_de" -> "ALKIS"
                "1350_45_de" -> "Gesetz über eine Holzstatistik"
                else -> "getCodelistValue " + firstArg<String>() + "_" + secondArg<String>() + "_" + thirdArg<String>()
            }
        }

        every { codelistService.getCodelistEntryDataField("6500", "25") } returns "{\"id\":\"dl-zero-de/2.0\",\"name\":\"Datenlizenz Deutschland – Zero – Version 2.0\",\"url\":\"https://www.govdata.de/dl-de/zero-2-0\",\"quelle\":\"\"}"
        every { codelistService.getCodelistEntryDataField("6500", "26") } returns null

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
