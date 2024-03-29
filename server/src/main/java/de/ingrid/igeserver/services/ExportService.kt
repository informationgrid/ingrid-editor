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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

data class ExportResult(val result: ByteArray, val fileName: String, val exportFormat: MediaType)

@Service
class ExportService(val exporterFactory: ExporterFactory) {

    private val log = logger()

    @Autowired
    @Lazy
    private lateinit var documentService: DocumentService

    fun getExporter(category: DocumentCategory, format: String): IgeExporter =
        exporterFactory.getExporter(category, format)

    fun getExportTypes(catalogId: String, profileId: String, onlyPublic: Boolean = true): List<ExportTypeInfo> {
        val profile = documentService.catalogService.getProfileFromCatalog(catalogId)
        return exporterFactory.typeInfos
            .filter { it.profiles.isEmpty() || it.profiles.contains(profileId) || it.profiles.contains(profile.parentProfile)}
            .filter { if (onlyPublic) it.isPublic else true }
    }

    fun export(catalogId: String, options: ExportRequestParameter): ExportResult {
        // TODO: option to export addresses too?
        val doc = documentService.getWrapperByDocumentIdAndCatalog(options.id)
        val exporter = getExporter(DocumentCategory.DATA, options.exportFormat)

        return if (doc.type == "FOLDER") {
            val result = handleWithSubDocuments(doc, options, catalogId)
            ExportResult(
                zipToFile(result, exporter.typeInfo.fileExtension),
                doc.uuid + ".zip",
                MediaType.valueOf("application/zip")
            )
        } else {
            ExportResult(
                handleSingleDataset(options, doc, catalogId).toByteArray(),
                doc.uuid + "." + exporter.typeInfo.fileExtension,
                MediaType.valueOf(exporter.typeInfo.dataType)
            )
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

    private fun handleSingleDataset(
        options: ExportRequestParameter,
        doc: DocumentWrapper,
        catalogId: String
    ): String {
        val docVersion =
            if (!options.useDraft) getPublishedVersion(catalogId, doc) else documentService.getDocumentByWrapperId(
                catalogId,
                doc.id!!,
                true
            )
        val exporter = getExporter(DocumentCategory.DATA, options.exportFormat)
        val result = exporter.run(docVersion, catalogId, ExportOptions(options.useDraft))
        return if (result is ObjectNode) result.toPrettyString() else result as String
    }

    private fun getPublishedVersion(
        catalogId: String,
        doc: DocumentWrapper
    ): Document {
        return try {
            documentService.getLastPublishedDocument(
                catalogId,
                doc.uuid,
                true
            )
        } catch (ex: Exception) {
            throw NotFoundException.withMissingPublishedVersion(doc.uuid)
        }
    }

    private fun handleWithSubDocuments(
        doc: DocumentWrapper,
        options: ExportRequestParameter,
        catalogId: String
    ): List<Pair<String, String>> {
        val isFolder = doc.type == "FOLDER"
        val result = if (isFolder) null else handleSingleDataset(options, doc, catalogId)

        val children = documentService.findChildren(catalogId, doc.id)
        val resultList = children.hits.flatMap { handleWithSubDocuments(it.wrapper, options, catalogId) }
        return if (result == null)
            resultList
        else
            resultList + Pair(doc.uuid, result)
    }
}
