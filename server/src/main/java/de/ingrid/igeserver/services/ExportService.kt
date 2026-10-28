/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import tools.jackson.databind.node.ObjectNode
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

data class ExportResult(val result: ByteArray?, val fileName: String, val exportFormat: MediaType)

@Service
class ExportService(val exporterFactory: ExporterFactory) {

    private val log = logger()

    @Autowired
    @Lazy
    private lateinit var documentService: DocumentService

    fun getExporter(category: DocumentCategory, format: String): IgeExporter = exporterFactory.getExporter(category, format)

    fun getExportTypes(catalogId: String, profileId: String, onlyPublic: Boolean = true): List<ExportTypeInfo> {
        val profile = documentService.catalogService.getProfileFromCatalog(catalogId)
        return exporterFactory.typeInfos
            .filter {
                it.profiles.isEmpty() ||
                    profileId in it.profiles ||
                    it.profiles.any(profile.linkedProfiles::contains)
            }
            .filter { !onlyPublic || it.isPublic }
            .filter { !profile.excludeExportProfiles.contains(it.type) }
    }

    fun export(catalogId: String, options: ExportRequestParameter): ExportResult {
        val docs = options.ids.map { documentService.getDocumentFromCatalog(catalogId, it) }
        val exporter = getExporter(DocumentCategory.DATA, options.exportFormat)
        val isSingleNonFolderDocument = docs.size == 1 && docs[0].wrapper.type != "FOLDER"
        val withAddressReferences = exporter is InternalExporter && options.addressReferences

        // a dataset can be reached multiple times within one request (e.g. a folder and one of
        // its children are selected, or several datasets reference the same address), so every
        // uuid is only exported once
        val visited = mutableSetOf<String>()
        val results = docs
            .flatMap { exportWithSubDocuments(it, options, catalogId, withAddressReferences, visited) }
            .distinctBy { it.first }

        return when {
            results.isEmpty() && isSingleNonFolderDocument -> {
                val doc = docs[0]
                val message = if (!options.useDraft) {
                    "Document was not exported since it might not have a published version: ${doc.wrapper.uuid}"
                } else {
                    "Document could not be exported: ${doc.wrapper.uuid}"
                }
                throw ServerException.withReason(message, data = mapOf("uuid" to doc.wrapper.uuid))
            }

            // keep the single-file response when the export consists of a single dataset
            // and address references are not requested
            results.size == 1 && !withAddressReferences -> {
                val (uuid, data) = results[0]
                ExportResult(
                    data.toByteArray(),
                    "$uuid.${exporter.typeInfo.fileExtension}",
                    MediaType.valueOf(exporter.typeInfo.dataType),
                )
            }

            else ->
                ExportResult(
                    zipToFile(results, exporter.typeInfo.fileExtension),
                    "export.zip",
                    MediaType.valueOf("application/zip"),
                )
        }
    }

    /**
     * Exports the given dataset including all of its sub-documents recursively.
     * Folders have no exportable content themselves, but every other dataset can also
     * have children, depending on the behavior set for the document type.
     * Address references are additionally exported for the internal format, if requested.
     * Each dataset is exported at most once per request, tracked by [visited].
     */
    private fun exportWithSubDocuments(
        document: DocumentData,
        options: ExportRequestParameter,
        catalogId: String,
        withAddressReferences: Boolean,
        visited: MutableSet<String>,
    ): List<Pair<String, String>> {
        if (!visited.add(document.wrapper.uuid)) return emptyList()

        val children = if (options.includeSubDocuments) {
            documentService.findChildren(catalogId, document.wrapper.id).hits
                .flatMap { exportWithSubDocuments(it, options, catalogId, withAddressReferences, visited) }
        } else {
            emptyList()
        }

        // folders have no exportable content themselves
        if (document.wrapper.type == "FOLDER") return children

        val exported = handleSingleDataset(options, document.wrapper, catalogId, withAddressReferences)
            ?: return children
        return if (withAddressReferences) {
            children + getReferencedExportedDatasets(exported.referencedUuids, options, catalogId, visited) +
                Pair(exported.uuid, exported.data)
        } else {
            children + Pair(exported.uuid, exported.data)
        }
    }

    /**
     * Exports the datasets referenced by the given UUIDs (e.g. addresses of the internal format).
     * A missing reference (e.g. deleted address) aborts the export, while a reference without
     * a published version is skipped when drafts are not exported.
     */
    private fun getReferencedExportedDatasets(
        referencedUuids: Set<String>,
        options: ExportRequestParameter,
        catalogId: String,
        visited: MutableSet<String>,
    ): List<Pair<String, String>> = referencedUuids
        .mapNotNull { uuid ->
            if (!visited.add(uuid)) return@mapNotNull null
            val ref = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
            handleSingleDataset(options, ref, catalogId, withReferences = false)?.let {
                Pair(ref.uuid, it.data)
            } ?: run {
                log.debug("Referenced dataset '$uuid' has no published version and is skipped in export")
                null
            }
        }

    private fun zipToFile(result: List<Pair<String, String>>, fileExtension: String): ByteArray {
        val byteArrayOutputStream = ByteArrayOutputStream()
        ZipOutputStream(BufferedOutputStream(byteArrayOutputStream)).use { outZip ->
            result.forEach { item ->
                item.second.byteInputStream().use { fi ->
                    BufferedInputStream(fi).use { origin ->
                        val entry = ZipEntry("${item.first}.$fileExtension")
                        outZip.putNextEntry(entry)
                        origin.copyTo(outZip, 1024)
                    }
                }
            }
        }

        return byteArrayOutputStream.toByteArray()
    }

    /**
     * Exports a single dataset in the requested format. When [withReferences] is set, the UUIDs
     * referenced by the exported version are extracted as well, so they always match the
     * exported content (published or draft).
     */
    private fun handleSingleDataset(
        options: ExportRequestParameter,
        doc: DocumentWrapper,
        catalogId: String,
        withReferences: Boolean,
    ): ExportedDataset? {
        val docVersion =
            if (!options.useDraft) {
                try {
                    getPublishedVersion(catalogId, doc)
                } catch (_: NotFoundException) {
                    return null
                }
            } else {
                documentService.getDocumentByWrapperId(
                    catalogId,
                    doc.id!!,
                    true,
                )
            }
        val exporter = getExporter(DocumentCategory.DATA, options.exportFormat)
        val result = exporter.run(docVersion, catalogId, ExportOptions(options.useDraft, null, doc.tags, false))
        val data = if (result is ObjectNode) result.toPrettyString() else result as String
        val referencedUuids = if (withReferences) documentService.getReferencedUuids(docVersion) else emptySet()
        return ExportedDataset(docVersion.uuid, data, referencedUuids)
    }

    private fun getPublishedVersion(
        catalogId: String,
        doc: DocumentWrapper,
    ): Document = try {
        documentService.getLastPublishedDocument(
            catalogId,
            doc.uuid,
            true,
        )
    } catch (_: Exception) {
        log.debug("Could not get last published document: ${doc.uuid}")
        throw NotFoundException.withMissingPublishedVersion(doc.uuid)
    }

    fun getNumExportedDatasets(ids: List<Int>): Int {
        val allIds = ids.flatMap {
            documentService.getAllDescendantIds("", it) + it
        }.toSet()

        return documentService.docWrapperRepo.findNonFolderWrapperByIds(allIds.map { it }).size
    }
}

/**
 * The result of exporting a single dataset: the exported content plus the UUIDs referenced
 * by exactly the version that was exported (published or draft).
 */
data class ExportedDataset(val uuid: String, val data: String, val referencedUuids: Set<String>)
