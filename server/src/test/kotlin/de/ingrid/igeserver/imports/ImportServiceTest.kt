/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.imports

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DeleteOptions
import de.ingrid.igeserver.services.DocumentService
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.security.core.Authentication

class ImportServiceTest : ShouldSpec() {

    private val notifier = mockk<JobsNotifier>(relaxed = true)
    val factory = mockk<ImporterFactory>(relaxed = true)
    private val docService = mockk<DocumentService>(relaxed = true)
    private val principal = mockk<Authentication>(relaxed = true)

    private val docEntity = Document().apply {
        data = jacksonObjectMapper().createObjectNode()
        title = "Test-Dataset"
        type = ""
    }

    val service = ImportService(notifier, factory, docService)

    override suspend fun beforeEach(testCase: TestCase) {
        clearAllMocks()
    }

    init {
        should("Count nothing when no references") {
            val options = ImportOptions()
            val analysis = OptimizedImportAnalysis(emptyList(), emptyList(), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 0, 0, 0)
        }

        should("Count documents") {
            every { docService.getWrapperByCatalogAndDocumentUuid(any(), any()) } throws Exception()

            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, false, false, false)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(1, 0, 0, 0)
        }

        should("Count addresses") {
            every { docService.getWrapperByCatalogAndDocumentUuid(any(), any()) } throws Exception()

            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, true, false, false)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 1, 0, 0)
        }

        should("Count overwritten documents when they exist") {
            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, false, true, false)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 0, 1, 0)
        }

        should("Count skipped addresses when they exist") {
            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, true, true, false)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 0, 0, 1)
        }

        should("Count overwritten addresses when they exist with option to overwrite") {
            val options = ImportOptions(overwriteAddresses = true)
            val doc = DocumentAnalysis(docEntity, 1, true, true, false)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 0, 1, 0)
        }

        should("Count documents when they have been deleted before") {
            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, false, false, true)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(1, 0, 0, 0)
            verify(exactly = 1) { docService.deleteDocument(any(), any(), any(), DeleteOptions(true, true)) }
            verify(exactly = 1) { docService.createDocument(any(), any(), any<Document>(), any(), any(), any(), any()) }
        }

        should("Count addresses when they have been deleted before") {
            val options = ImportOptions()
            val doc = DocumentAnalysis(docEntity, 1, true, false, true)
            val analysis = OptimizedImportAnalysis(emptyList(), listOf(doc), 0, 0, emptyList(), emptyList())
            val result = service.importAnalyzedDatasets(principal, "", analysis, options, Message())

            result shouldBe ImportCounter(0, 1, 0, 0)
        }
    }
}
