package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import mockCodelists

class Geodataset : AnnotationSpec() {

    private val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()


    private lateinit var exporter: IngridIDFExporter
    private lateinit var indexExporter: IngridIndexExporter
    private lateinit var luceneExporter: IngridLuceneExporter
    private val documentWrapperRepository = mockk<DocumentWrapperRepository>()
    private val codelistHandler = mockk<CodelistHandler>()
    private val config = mockk<Config>()

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistHandler, config, catalogService)
        this.luceneExporter = IngridLuceneExporter(codelistHandler, config, catalogService)
        this.indexExporter = IngridIndexExporter(this.exporter, this.luceneExporter, documentWrapperRepository)

        mockCodelists(codelistHandler)

        every { catalogService.getCatalogById(any()) } answers {
            Catalog()
        }
    }

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

        var result = exportJsonToXML(exporter, "/export/ingrid/geodataset-Document2.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document2.idf.xml")
    }


    @Test
    fun completeLuceneExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToJson(indexExporter, "/export/ingrid/geodataset-Document2.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document2.lucene.json")
    }

}
