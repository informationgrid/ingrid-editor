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
package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.profiles.uvp.UvpDocumentReferences
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import tools.jackson.core.JacksonException
import tools.jackson.module.kotlin.jacksonObjectMapper

@Component
class RemoveUnreferencedDocsTask(
    val storage: FileSystemStorage,
    val entityManager: EntityManager,
    val catalogRepo: CatalogRepository,
) {

    private val log = logger()
    private val objectMapper = jacksonObjectMapper()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun start(): List<String> {
        log.info("Starting Task: Remove-Unreferenced-Docs")
        val uvpCatalogs = catalogRepo.findAllByType("uvp")
        val documents = if (uvpCatalogs.isNotEmpty()) queryDocs() else emptyList()
        val documentsByCatalog = documents.groupBy { it[1].toString() }
        val unreferencedFiles = uvpCatalogs.flatMap { catalog ->
            cleanupFilesForCatalogId(catalog.identifier, documentsByCatalog[catalog.identifier].orEmpty())
        }
        log.debug("Task finished: Remove-Unreferenced-Docs")
        return unreferencedFiles
    }

    private fun cleanupFilesForCatalogId(catalogId: String, documentRows: List<Array<Any?>>): List<String> {
        val allUploads = extractUploads(catalogId, documentRows) ?: return emptyList()

        val publishedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.PUBLISHED)
        val draftFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.UNPUBLISHED)
        val archivedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.ARCHIVED)
        val archivedUnpublishedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.ARCHIVED_UNPUBLISHED)

        val allFiles = buildList {
            addAll(publishedFiles)
            addAll(draftFiles)
            addAll(archivedFiles)
            addAll(archivedUnpublishedFiles)
        }
        val referencedFiles = allUploads.flatMap { document ->
            document.uris.map { uri ->
                FileIdentity(
                    document.catalogId,
                    document.uuid,
                    "${document.uuid}${FileSystemItem.URI_PATH_SEPARATOR}$uri",
                )
            }
        }.toSet()
        val unreferencedFiles = allFiles.filterNot { file ->
            val relativePath = file.relativePath
            val documentUuid = relativePath.substringBefore(FileSystemItem.URI_PATH_SEPARATOR)
            FileIdentity(catalogId, documentUuid, relativePath) in referencedFiles
        }

        log.debug(
            "${referencedFiles.size} files with references and ${unreferencedFiles.size} " +
                "are not referenced in catalog '$catalogId'",
        )

        if (unreferencedFiles.isNotEmpty()) {
            log.info("Moving ${unreferencedFiles.size} unreferenced files from $catalogId to trash ...")
            unreferencedFiles.forEach {
                log.info("File: ${it.path}/${it.file}")
                storage.delete(catalogId, it)
            }
        }
        return unreferencedFiles.map { "$catalogId -> ${it.path}/${it.file}" }
    }

    private fun extractUploads(catalogId: String, documentRows: List<Array<Any?>>): List<DocUrls>? {
        val uploads = mutableListOf<DocUrls>()
        var reliable = true
        documentRows.forEach { row ->
            if (!reliable) return@forEach
            val documentUuid = row[0].toString()
            val title = row.getOrNull(DOCUMENT_TITLE_COLUMN_INDEX)?.toString() ?: ""
            val extraction = try {
                UvpDocumentReferences.extractDocument(objectMapper.readTree(row[2].toString()))
            } catch (e: JacksonException) {
                log.error(
                    "Skipping cleanup for catalog '$catalogId': cannot read attachment references " +
                        "for document '$documentUuid' ('$title')",
                    e,
                )
                reliable = false
                null
            } ?: return@forEach
            if (!extraction.isReliableForCleanup) {
                log.error(
                    "Skipping cleanup for catalog '$catalogId': ambiguous attachment references " +
                        "in document '$documentUuid' ('$title'): ${extraction.diagnostics}",
                )
                reliable = false
                return@forEach
            }
            uploads.add(
                DocUrls(
                    catalogId,
                    documentUuid,
                    extraction.references.filterNot { it.isExternalLink }.map { it.uri },
                ),
            )
        }
        return uploads.takeIf { reliable }
    }

    @Suppress("SqlSourceToSinkFlow")
    internal fun queryDocs(): List<Array<Any?>> {
        @Suppress("UNCHECKED_CAST")
        return entityManager.createNativeQuery(sqlUvpDocumentsWithDrafts).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar("data")
            .addScalar("title")
            .resultList as List<Array<Any?>>
    }

    private data class DocUrls(val catalogId: String, val uuid: String, val uris: List<String>)

    private data class FileIdentity(val catalogId: String, val documentUuid: String, val relativePath: String)

    private companion object {
        const val DOCUMENT_TITLE_COLUMN_INDEX = 3
    }
}
