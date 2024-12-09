package de.ingrid.igeserver.catalogTransfer

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.CatalogApiController
import de.ingrid.igeserver.exports.catalog.CatalogExportService
import de.ingrid.igeserver.exports.catalog.CatalogTransferService.ExportedCatalog
import de.ingrid.igeserver.imports.CatalogImportService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.utils.AuthUtils
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import org.springframework.transaction.PlatformTransactionManager
import java.nio.file.Files
import java.nio.file.Paths

class CatalogTransferTest : ShouldSpec() {

    private val entityManager = mockk<EntityManager>(relaxed = true)
    private val transactionManager = mockk<PlatformTransactionManager>(relaxed = true)
    private val groupService = mockk<GroupService>(relaxed = true)
    private val catalogService = mockk<CatalogService>(relaxed = true)
    private val catalogImportService = CatalogImportService(entityManager, transactionManager, groupService, catalogService)
    private val catalogExportService = CatalogExportService(entityManager, transactionManager)
    private val authUtils = mockk<AuthUtils>(relaxed = true)
    private val catalogApiController = CatalogApiController(catalogService, mockk(), mockk(), catalogImportService, catalogExportService, authUtils)

    override suspend fun beforeEach(testCase: TestCase) {
        clearAllMocks()
        mockEntityManagerTupleResults(entityManager)
        every { authUtils.isAdmin(any()) } returns true
    }

    init {
        should("export catalog correctly") {

            val exportedCatIdentifier = catalogInfo["identifier"] as String
            val exported = catalogExportService.exportCatalog(exportedCatIdentifier)
            exported shouldBe expectedExportedCatalog
        }

        should("export catalog via api") {

            val exportedCatIdentifier = catalogInfo["identifier"] as String
            val exported = catalogApiController.catalogExport(mockk(), exportedCatIdentifier).body as ByteArray
            // TODO: Compare to actual file
            // exported shouldBe getFile("export/catalog/testexport.json")
        }

        should("import catalog correctly") {
            val file = getFile("export/catalog/testexport.json")
            val data = jacksonObjectMapper().readValue<ExportedCatalog>(file)

            catalogImportService.importCatalog(data)
        }

        should("not import catalog with wrong version") {
            val file = getFile("export/catalog/with_wrong_version.json")
            val data = jacksonObjectMapper().readValue<ExportedCatalog>(file)

            val exception = shouldThrow<ServerException> {
                catalogImportService.importCatalog(data)
            }
            exception.message shouldBe "The editor version of the exported catalog is different from the current version: 0.WRONG != 0.XX"
        }

        should("not import catalog with existing catalog id") {
            every { catalogService.catalogExists(any()) } answers { firstArg<String>() == "existing_identifier" }

            val file = getFile("export/catalog/with_existing_catalog_identifier.json")
            val data = jacksonObjectMapper().readValue<ExportedCatalog>(file)

            val exception = shouldThrow<ServerException> {
                catalogImportService.importCatalog(data)
            }
            exception.message shouldBe "The catalog with identifier existing_identifier already exists"
        }
    }

    private fun getFile(file: String) = Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI()))
}
