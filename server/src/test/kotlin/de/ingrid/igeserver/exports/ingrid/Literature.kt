package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import mockCodelists

class Literature : AnnotationSpec() {

    private val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()

    private val codelistService = mockk<CodelistHandler>()
    private val config = mockk<Config>()
    private lateinit var exporter: IngridIDFExporter

    @BeforeAll
    fun beforeAll() {
        this.exporter = IngridIDFExporter(codelistService, config, catalogService)
        mockCodelists(codelistService)
        every { catalogService.getCatalogById(any()) } answers {
            Catalog()
        }
    }

    @Test
    fun literatureExport() {
        every { documentService.getWrapperByDocumentId(any() as Int) } returns DocumentWrapper()

        var result = exportJsonToXML(exporter, "/export/ingrid/literature-Document1.json")
        // replace generated UUIDs and windows line endings
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
            .replace("\r\n", "\n")

        result shouldNotBe null
        // TODO: pending
        // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/literature-Document1.idf.xml")
    }

    @Test
    fun completeExport() {
    }
}