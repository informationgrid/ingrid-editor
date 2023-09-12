package de.ingrid.igeserver.exports.ingrid

import MockDocument
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
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
import initDocumentMocks
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockCatalog
import mockCodelists

class DataCollection : AnnotationSpec() {

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
                "1350_61" -> "23. Bundesimmissionsschutzverordnung"
                "1350_62" -> "Abfallgesetz (AbfG)"
                else -> codelistId + "_" + entryId
            }
        }

        mockCatalog(catalogService)
        mockCodelists(codelistHandler)

        val addresses = listOf(
            MockDocument(
                1638,
                "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
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

        initDocumentMocks(addresses + dataset, documentService)
    }

    /*
    * export with all inputs possible.
    * address has an organization assigned.
    * */
    @Test
    fun maximalExport() {
        var result = exportJsonToXML(exporter, "/export/ingrid/data-collection.sample.maximal.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

        result shouldNotBe null
        result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/data-collection.expected.maximal.idf.xml")
    }

}
