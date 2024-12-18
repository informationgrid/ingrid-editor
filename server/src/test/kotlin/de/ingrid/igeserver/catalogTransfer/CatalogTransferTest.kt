/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
import io.mockk.verify
import jakarta.persistence.EntityManager
import org.springframework.transaction.PlatformTransactionManager
import java.nio.file.Files
import java.nio.file.Paths

class CatalogTransferTest : ShouldSpec() {

    private val entityManager = mockk<EntityManager>(relaxed = true)
    private val transactionManager = mockk<PlatformTransactionManager>(relaxed = true)
    private val groupService = mockk<GroupService>(relaxed = true)
    private val catalogService = mockk<CatalogService>(relaxed = true)
    private val catalogImportService = CatalogImportService(entityManager, transactionManager, groupService, catalogService, mockk())
    private val catalogExportService = CatalogExportService(entityManager, transactionManager, catalogService)
    private val authUtils = mockk<AuthUtils>(relaxed = true)
    private val catalogApiController = CatalogApiController(catalogService, mockk(), mockk(), catalogImportService, catalogExportService, authUtils)

    override suspend fun beforeEach(testCase: TestCase) {
        clearAllMocks()
        mockEntityManagerTupleResults(entityManager)
        every { authUtils.isSuperAdmin(any()) } returns true
        every { catalogService.getAllCatalogUsers(any<String>()) } returns users
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
            verify(exactly = 6) { entityManager.createNativeQuery(any<String>()).executeUpdate() }
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
