/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission – subsequent versions of the
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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.mockk.clearMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.test.util.ReflectionTestUtils
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.io.ByteArrayInputStream
import java.util.zip.ZipInputStream

class ExportServiceTest :
    ShouldSpec({

        val mapper = jacksonObjectMapper()
        val catalogId = "test"

        val documentService = mockk<DocumentService>()
        val catalogService = mockk<CatalogService>()
        val exporter = InternalExporter(documentService, catalogService)
        val isoExporter = mockk<IgeExporter> {
            every { typeInfo } returns ExportTypeInfo(
                category = DocumentCategory.DATA,
                type = "iso",
                name = "ISO 19115",
                description = "ISO metadata",
                dataType = "text/xml",
                fileExtension = "xml",
                profiles = listOf(),
            )
        }
        val exportService = ExportService(ExporterFactory(listOf(exporter, isoExporter))).apply {
            ReflectionTestUtils.setField(this, "documentService", documentService)
        }

        beforeAny {
            // keep the typeInfo stub of the exporter mocks
            clearMocks(documentService, catalogService)
            every { catalogService.getProfileFromCatalog(catalogId).identifier } returns catalogId
        }

        fun document(uuid: String, type: String): Document = Document().apply {
            this.uuid = uuid
            this.type = type
            this.title = "title-$uuid"
            this.state = DocumentState.PUBLISHED
            this.data = mapper.createObjectNode()
        }

        fun wrapper(id: Int, uuid: String, type: String): DocumentWrapper = DocumentWrapper().apply {
            this.id = id
            this.uuid = uuid
            this.type = type
        }

        fun zipEntries(result: ByteArray?): List<String> {
            val entries = mutableListOf<String>()
            ZipInputStream(ByteArrayInputStream(result)).use { zip ->
                while (true) {
                    val entry = zip.nextEntry ?: break
                    entries.add(entry.name)
                }
            }
            return entries
        }

        should("export address references of all datasets within a folder") {
            val folder = wrapper(1, "folder-uuid", "FOLDER")
            val dataset = wrapper(2, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")
            val address = wrapper(3, "address-uuid", "InGridOrganisationDoc")
            val addressVersion = document("address-uuid", "InGridOrganisationDoc")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(folder, document("folder-uuid", "FOLDER"))
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(dataset, datasetVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { documentService.getReferencedUuids(datasetVersion) } returns setOf("address-uuid")
            every { documentService.getWrapperByCatalogAndDocumentUuid(catalogId, "address-uuid") } returns address
            every { documentService.getLastPublishedDocument(catalogId, "address-uuid", true) } returns addressVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = true),
            )

            result.fileName shouldBe "export.zip"
            zipEntries(result.result) shouldContainExactlyInAnyOrder listOf("dataset-uuid.json", "address-uuid.json")
            // references must be extracted from the exported (published) version
            verify(exactly = 1) { documentService.getReferencedUuids(datasetVersion) }
        }

        should("not export address references within a folder when option is not set") {
            val folder = wrapper(1, "folder-uuid", "FOLDER")
            val dataset = wrapper(2, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(folder, document("folder-uuid", "FOLDER"))
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(dataset, datasetVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = false),
            )

            // folder itself is not counted; its single child is exported as a single file
            result.fileName shouldBe "dataset-uuid.json"
            String(result.result!!) shouldContain "\"_profile\""
            verify(exactly = 0) { documentService.getReferencedUuids(any()) }
        }

        should("export sub-documents of a selected dataset") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val child = wrapper(2, "child-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")
            val childVersion = document("child-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(child, childVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { documentService.getLastPublishedDocument(catalogId, "child-uuid", true) } returns childVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = false),
            )

            result.fileName shouldBe "export.zip"
            zipEntries(result.result) shouldContainExactlyInAnyOrder listOf("dataset-uuid.json", "child-uuid.json")
        }

        should("export a dataset selected directly and within a folder only once") {
            val folder = wrapper(1, "folder-uuid", "FOLDER")
            val dataset = wrapper(2, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(folder, document("folder-uuid", "FOLDER"))
            every { documentService.getDocumentFromCatalog(catalogId, 2) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(dataset, datasetVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1, 2), exportFormat = "internal", useDraft = false, addressReferences = false),
            )

            // a single dataset remains → single-file response
            result.fileName shouldBe "dataset-uuid.json"
            verify(exactly = 1) { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) }
        }

        should("export a referenced address only once when several datasets reference it") {
            val dataset1 = wrapper(1, "dataset-uuid-1", "InGridGeoDataset")
            val dataset2 = wrapper(2, "dataset-uuid-2", "InGridGeoDataset")
            val version1 = document("dataset-uuid-1", "InGridGeoDataset")
            val version2 = document("dataset-uuid-2", "InGridGeoDataset")
            val address = wrapper(3, "address-uuid", "InGridOrganisationDoc")
            val addressVersion = document("address-uuid", "InGridOrganisationDoc")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset1, version1)
            every { documentService.getDocumentFromCatalog(catalogId, 2) } returns DocumentData(dataset2, version2)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid-1", true) } returns version1
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid-2", true) } returns version2
            every { documentService.getReferencedUuids(version1) } returns setOf("address-uuid")
            every { documentService.getReferencedUuids(version2) } returns setOf("address-uuid")
            every { documentService.getWrapperByCatalogAndDocumentUuid(catalogId, "address-uuid") } returns address
            every { documentService.getLastPublishedDocument(catalogId, "address-uuid", true) } returns addressVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1, 2), exportFormat = "internal", useDraft = false, addressReferences = true),
            )

            result.fileName shouldBe "export.zip"
            zipEntries(result.result) shouldContainExactlyInAnyOrder listOf(
                "dataset-uuid-1.json",
                "dataset-uuid-2.json",
                "address-uuid.json",
            )
            verify(exactly = 1) { documentService.getLastPublishedDocument(catalogId, "address-uuid", true) }
        }

        should("return a single file when exporting a dataset without sub-documents and without address references") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = false),
            )

            result.fileName shouldBe "dataset-uuid.json"
            String(result.result!!) shouldContain "\"_profile\""
        }

        should("fail when a referenced address does not exist anymore") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { documentService.getReferencedUuids(datasetVersion) } returns setOf("missing-address-uuid")
            every { documentService.getWrapperByCatalogAndDocumentUuid(catalogId, "missing-address-uuid") } throws
                NotFoundException.withMissingResource("missing-address-uuid", null)

            shouldThrow<NotFoundException> {
                exportService.export(
                    catalogId,
                    ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = true),
                )
            }
        }

        should("fail when a single dataset has no published version") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } throws
                NotFoundException.withMissingPublishedVersion("dataset-uuid")

            shouldThrow<ServerException> {
                exportService.export(
                    catalogId,
                    ExportRequestParameter(ids = listOf(1), exportFormat = "internal", useDraft = false, addressReferences = true),
                )
            }
        }

        // behavior for exporters other than the internal one

        should("return a single file for a dataset without children using a non-internal exporter") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { isoExporter.run(datasetVersion, catalogId, any()) } returns "<xml/>"

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "iso", useDraft = false),
            )

            result.fileName shouldBe "dataset-uuid.xml"
            result.exportFormat.toString() shouldBe "text/xml"
            String(result.result!!) shouldBe "<xml/>"
            verify(exactly = 0) { documentService.getReferencedUuids(any()) }
        }

        should("export sub-documents of a dataset using a non-internal exporter") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val child = wrapper(2, "child-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")
            val childVersion = document("child-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(child, childVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { documentService.getLastPublishedDocument(catalogId, "child-uuid", true) } returns childVersion
            every { isoExporter.run(any(), catalogId, any()) } returnsMany listOf("<xml-parent/>", "<xml-child/>")

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "iso", useDraft = false),
            )

            result.fileName shouldBe "export.zip"
            zipEntries(result.result) shouldContainExactlyInAnyOrder listOf("dataset-uuid.xml", "child-uuid.xml")
        }

        should("export a folder without address references using a non-internal exporter") {
            val folder = wrapper(1, "folder-uuid", "FOLDER")
            val dataset = wrapper(2, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(folder, document("folder-uuid", "FOLDER"))
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(1, listOf(DocumentData(dataset, datasetVersion)))
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { isoExporter.run(datasetVersion, catalogId, any()) } returns "<xml/>"

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1), exportFormat = "iso", useDraft = false),
            )

            result.fileName shouldBe "dataset-uuid.xml"
            String(result.result!!) shouldBe "<xml/>"
        }

        should("ignore the address reference option for non-internal exporters") {
            val dataset = wrapper(1, "dataset-uuid", "InGridGeoDataset")
            val datasetVersion = document("dataset-uuid", "InGridGeoDataset")
            val second = wrapper(2, "second-uuid", "InGridGeoDataset")
            val secondVersion = document("second-uuid", "InGridGeoDataset")

            every { documentService.getDocumentFromCatalog(catalogId, 1) } returns DocumentData(dataset, datasetVersion)
            every { documentService.getDocumentFromCatalog(catalogId, 2) } returns DocumentData(second, secondVersion)
            every { documentService.findChildren(catalogId, 1) } returns FindAllResults(0, emptyList())
            every { documentService.findChildren(catalogId, 2) } returns FindAllResults(0, emptyList())
            every { documentService.getLastPublishedDocument(catalogId, "dataset-uuid", true) } returns datasetVersion
            every { documentService.getLastPublishedDocument(catalogId, "second-uuid", true) } returns secondVersion
            every { isoExporter.run(any(), catalogId, any()) } returnsMany listOf("<xml-a/>", "<xml-b/>")

            val result = exportService.export(
                catalogId,
                ExportRequestParameter(ids = listOf(1, 2), exportFormat = "iso", useDraft = false, addressReferences = true),
            )

            result.fileName shouldBe "export.zip"
            zipEntries(result.result) shouldContainExactlyInAnyOrder listOf("dataset-uuid.xml", "second-uuid.xml")
            verify(exactly = 0) { documentService.getReferencedUuids(any()) }
            verify(exactly = 0) { documentService.getWrapperByCatalogAndDocumentUuid(any(), any()) }
        }
    })
