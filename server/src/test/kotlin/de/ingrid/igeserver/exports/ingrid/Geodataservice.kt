package de.ingrid.igeserver.exports.ingrid

import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
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
import org.springframework.test.context.ActiveProfiles

class Geodataservice : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val codelistHandler = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistHandler, config, catalogService)
        this.luceneExporter = IngridLuceneExporter(codelistHandler, config, catalogService)
        this.indexExporter = IngridIndexExporter(this.exporter, this.luceneExporter)


        every { codelistHandler.getCodelistValue(any<String>(), any<String>(), any<String>()) } answers {
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
                "510_3_iso" -> "utf7"
                "514_2_iso" -> "column"
                "514_5_iso" -> "crossTrack"
                "518_1_iso" -> "continual"
                "520_1_iso" -> "cdRom"
                "520_4_iso" -> "3halfInchFloppy"
                "520_14_iso" -> "digitalLinearTape"
                "523_4_iso" -> "onGoing"
                "523_6_iso" -> "required"
                "526_2_iso" -> "tin"
                "526_4_iso" -> "grid"
                "527_13_iso" -> "location"
                "527_17_iso" -> "structure"
                "1230_5_de" -> "Monate"
                "1320_23_de" -> "AI"
                "1320_24_de" -> "3D-Shape"
                "5153_1_iso" -> "OGC:WMS 1.1.1"
                "5153_2_iso" -> "OGC:WMS 1.3.0"
                "5200_303_iso" -> "subscriptionService"
                "5300_2_iso" -> "view"
                "3535_1_de" -> "von Drachenfels 94"
                "3555_1_de" -> "Ganzflächige Biotopkartierung 94"
                "6005_10_iso" -> "VERORDNUNG (EG) Nr. 976/2009 DER KOMMISSION vom 19. Oktober 2009 zur Durchführung der Richtlinie 2007/2/EG des Europäischen Parlaments und des Rates hinsichtlich der Netzdienste"
                "6005_12_iso" -> "VERORDNUNG (EG) Nr. 1089/2010 DER KOMMISSION vom 23. November 2010 zur Durchführung der Richtlinie 2007/2/EG des Europäischen Parlaments und des Rates hinsichtlich der Interoperabilität von Geodatensätzen und -diensten"
                "6100_105_de" -> "Adressen"
                "6100_313_de" -> "Atmosphärische Bedingungen"
                "6100_314_de" -> "Meteorologisch-geografische Kennwerte"
                "110_8_de" -> "Hessen"
                "6350_-79614265_de" -> "Abfalldeponien (Deponierichtlinie)"
                "6360_1339931727_de" -> "Europäisch"
                "6400_3_de" -> "EDUC"
                "6400_9_de" -> "SOCI"
                "6500_25_de" -> "Datenlizenz Deutschland – Zero – Version 2.0"
                "6500_18_de" -> "Andere Freeware Lizenz"
                "6500_26_de" -> "Es gelten keine Bedingungen"
                "7112_2_de" -> "Conceptual Schema compliance"
                "7120_1_de" -> "Percentage of items that are correctly events ordered"
                "7112_3_de" -> "Compliance rate with the rules of the conceptual schema"
                "7113_1_de" -> "Value domain non conformance rate"
                "7125_1_de" -> "Misclassification rate"
                "7126_1_de" -> "Number of incorrect attribute values"
                "7128_1_de" -> "mean value of positional uncertainties (1D)"
                "7109_2_de" -> "Number of duplicate feature instances"
                "7115_1_de" -> "Number of invalid overlaps of surfaces"
                "7127_1_de" -> "Attribute value uncertainty at 95 % significance level"
                "7114_1_de" -> "Physical structure conflict rate"
                "7109_1_de" -> "Rate of excess items"
                "8010_1_de" -> "Digitale Landschaftsmodelle"
                "8010_2_de" -> "Digitale Geländemodelle"
                "8010_4_de" -> "3D-Gebäudemodelle"
                "8010_8_de" -> "ALKIS"
                "1350_45_de" -> "Gesetz über eine Holzstatistik"
                else -> "getCodelistValue " + firstArg<String>() + "_" + secondArg<String>() + "_" + thirdArg<String>()
            }
        }


        every {
            codelistHandler.getCodelistEntryDataField(
                "6350",
                "-79614265"
            )
        } returns "{\"url\":\"http://inspire.ec.europa.eu/metadata-codelist/PriorityDataset/LandfillOfWasteSites-dir-1999-31\"}"
        every {
            codelistHandler.getCodelistEntryDataField(
                "6360",
                "1339931727"
            )
        } returns "{\"url\":\"http://inspire.ec.europa.eu/metadata-codelist/SpatialScope/european\", \"thesaurusTitle\": \"Spatial scope\", \"thesaurusId\": \"http://inspire.ec.europa.eu/metadata-codelist/SpatialScope\" }"
        every {
            codelistHandler.getCodelistEntryDataField(
                "6500",
                "25"
            )
        } returns "{\"id\":\"dl-zero-de/2.0\",\"name\":\"Datenlizenz Deutschland – Zero – Version 2.0\",\"url\":\"https://www.govdata.de/dl-de/zero-2-0\",\"quelle\":\"\"}"
        every {
            codelistHandler.getCodelistEntryDataField(
                "6500",
                "18"
            )
        } returns "{\"id\":\"other-freeware\",\"name\":\"Andere Freeware Lizenz\",\"url\":\"\",\"quelle\":\"\"}"
        every { codelistHandler.getCodelistEntryDataField("6500", "26") } returns null

    }


    private lateinit var exporter: IngridIDFExporter
    private lateinit var indexExporter: IngridIndexExporter
    private lateinit var luceneExporter: IngridLuceneExporter


    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    // this bean must be mocked although it might not be used in this class
    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    val GENERATED_UUID_REGEX = Regex("ID_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


    /*    @Test
        fun minimalExport() {
            every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

            var result = exportJsonToXML(exporter, "/export/ingrid/geodataset-Document1.json")
            // replace generated UUIDs and windows line endings
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
                .replace("\r\n", "\n")

            result shouldNotBe null
            // TODO: pending
            // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document1.idf.xml")
        }*/

    @Test
    fun completeExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToXML(exporter, "/export/ingrid/geodataservice.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataservice.idf.xml")
    }


    @Test
    fun completeLuceneExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToJson(indexExporter, "/export/ingrid/geodataservice.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataservice.lucene.json")
    }

}
