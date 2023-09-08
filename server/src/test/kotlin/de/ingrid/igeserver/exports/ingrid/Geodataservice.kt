package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.*
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.Config
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockCodelists
import org.springframework.test.context.ContextConfiguration

@ContextConfiguration(classes = [Geodataservice::class])
class Geodataservice : AnnotationSpec() {

    private val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()

    private val codelistHandler = mockk<CodelistHandler>()
    private val documentWrapperRepository = mockk<DocumentWrapperRepository>(relaxed = true)
    private val config = mockk<Config>()

    private lateinit var exporter: IngridIDFExporter
    private lateinit var indexExporter: IngridIndexExporter
    private lateinit var luceneExporter: IngridLuceneExporter

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistHandler, config, catalogService)
        this.luceneExporter = IngridLuceneExporter(codelistHandler, config, catalogService)
        this.indexExporter = IngridIndexExporter(this.exporter, this.luceneExporter, documentWrapperRepository)

        mockkObject(SpringContext.Companion)
        every { SpringContext.getBean(DocumentService::class.java) } answers {
            documentService
        }

        every { codelistHandler.getCatalogCodelistValue(any(), any(), any()) } answers {
            val codelistId = secondArg<String>()
            val entryId = thirdArg<String>()
            when (codelistId + "_" + entryId) {
                "1350_1" -> "Baugesetzbuch (BauGB)"
                "1350_2" -> "Atomgesetz (AtG)"
                "111_1" -> "Provider 1"
                "111_2" -> "Provider 2"
                "6250_7" -> "Hessen"
                else -> codelistId + "_" + entryId
            }
        }

        mockCatalog()
        mockCodelists(codelistHandler)

        val addresses = listOf(
            MockDocument(
                1638,
                "53DC4D57-1BA3-4647-8CBF-E57168FFE2FF",
                "/export/ingrid/address.organisation.sample.json",
                type = "InGridOrganisationDoc"
            ),
            MockDocument(
                1634,
                "14a37ded-4ca5-4677-bfed-3607bed3071d",
                "/export/ingrid/address.person.sample.json",
                1638
            ),
            MockDocument(
                1652,
                "fc521f66-0f47-45fb-ae42-b14fc669942e",
                "/export/ingrid/address.person2.sample.json",
                1638
            )
        )

        val dataset = MockDocument(
            uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
            template = "/export/ingrid/geo-dataset.maximal.sample.json"
        )

        initDocumentMocks(addresses + dataset)


    }

    private fun mockCatalog() {
        every { catalogService.getCatalogById(any()) } answers {
            Catalog().apply {
                settings = CatalogSettings().apply {
                    config = CatalogConfig().apply {
                        //namespace = "namespace"
                        atomDownloadUrl = "https://dev.informationgrid.eu/interface-search/dls/service/"
                    }
                }
            }
        }
    }

    data class MockDocument(
        val id: Number? = null,
        val uuid: String,
        val template: String,
        val parent: Int? = null,
        val type: String? = null,
    )

    private fun initDocumentMocks(documents: List<MockDocument>) {
        documents.forEach { document ->
            every {
                documentService.getLastPublishedDocument(
                    "test-catalog",
                    document.uuid,
                    false
                )
            } answers {
                convertToDocument(SchemaUtils.getJsonFileContent(document.template))
            }
            if (document.id != null) {
                every { documentService.getWrapperByDocumentId(document.id.toInt()) } answers {
                    createDocumentWrapper().apply {
                        id = document.id.toInt()
                        type = document.type ?: "testDocType"
                        parent = document.parent?.let {
                            DocumentWrapper().apply {
                                id = it
                            }
                        }
                        uuid = document.uuid
                    }
                }
            }
        }
    }


    /*
    * export with only required inputs.
    * address has no organization assigned.
    * */
    @Test
    fun minimalExport() {
        val result = exportJsonToXML(exporter, "/export/ingrid/geo-service.minimal.sample.json")
        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-service.minimal.expected.idf.xml")
    }

    /*
    * export with all inputs possible.
    * three addresses with different roles have an organization assigned.
    * */
    @Test
    fun maximalExport() {
        var result = exportJsonToXML(exporter, "/export/ingrid/geo-service.maximal.sample.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-service.maximal.expected.idf.xml")
    }

    /*
    * export with only required inputs and  Download-Dienste selected.
    * address has no organization assigned.
    * */
    @Test
    fun downloadDiensteExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns createDocumentWrapper()
        val result = exportJsonToXML(exporter, "/export/ingrid/geo-service.DownloadDienste.json")
        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-service.DownloadDienste.expected.idf.xml")
    }

    @Test
    fun completeExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns createDocumentWrapper()

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
        var result = exportJsonToJson(indexExporter, "/export/ingrid/geodataservice.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataservice.lucene.json")
    }

    private fun createDocumentWrapper() =
        DocumentWrapper().apply {
            type = "testDocType"
        }


}
