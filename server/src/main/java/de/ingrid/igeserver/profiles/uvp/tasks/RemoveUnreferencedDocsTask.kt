package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.utils.UploadInfo
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Profile("uvp")
@Component
class RemoveUnreferencedDocsTask(
    val storage: FileSystemStorage,
    val entityManager: EntityManager,
    val catalogRepo: CatalogRepository
) {

    private val log = logger()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun start(): List<String> {
        log.info("Starting Task: Remove-Unreferenced-Docs")
        val uvpCatalogs = catalogRepo.findAllByType("uvp")
        val unreferencedFiles = uvpCatalogs.flatMap { cleanupFilesForCatalogId(it.identifier) }
        log.debug("Task finished: Remove-Unreferenced-Docs")
        return unreferencedFiles
    }

    private fun cleanupFilesForCatalogId(catalogId: String): List<String> {
        val docs = queryDocs(sqlStepsWithDrafts, "step")
        val negativeDocs = queryDocs(sqlNegativeDecisionDocsWithDraft, "negativeDocs")

        val uploads = docs.map {
            val data = jacksonObjectMapper().readValue(it[2] as String, JsonNode::class.java)
            DocUrls(it[1] as String, it[0] as String, getUrlsFromJsonField(data))
        }
        val uploadsNegative = negativeDocs.map {
            val data = jacksonObjectMapper().readValue(it[2] as String, JsonNode::class.java)
            DocUrls(
                it[1] as String,
                it[0] as String,
                getUrlsFromJsonFieldTable(data, "uvpNegativeDecisionDocs")
            )
        }
        val allUploads = uploads + uploadsNegative

        val publishedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.PUBLISHED)
        val draftFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.UNPUBLISHED)
        val archivedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.ARCHIVED)
        val archivedUnpublishedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.ARCHIVED_UNPUBLISHED)

        val allFiles = publishedFiles + draftFiles + archivedFiles + archivedUnpublishedFiles
        val referencedFiles = getReferencedFilesOfCatalog(allFiles, allUploads, catalogId)

        val unreferencedFiles = allFiles.filter { file -> referencedFiles.none { ref -> ref.file == file.file } }

        log.debug("${referencedFiles.size} files with references and ${unreferencedFiles.size} are not referenced in catalog '$catalogId'")

        if (unreferencedFiles.isNotEmpty()) {
            log.info("Moving ${unreferencedFiles.size} unreferenced files from $catalogId to trash ...")
            unreferencedFiles.forEach {
                log.info("File: ${it.path}/${it.file}")
                storage.delete(catalogId, it)
            }
        }
        return unreferencedFiles.map { "$catalogId -> ${it.path}/${it.file}" }
    }

    private fun getReferencedFilesOfCatalog(
        allFiles: List<FileSystemItem>,
        allUploads: List<DocUrls>,
        catalogId: String
    ): MutableList<FileSystemItem> {
        val referencedFiles = mutableListOf<FileSystemItem>()
        allFiles.forEach { file ->
            allUploads
                .filter { it.catalogId == catalogId }
                .filter { file.path.startsWith(it.uuid) }
                .filter { it.urls.any { url -> it.uuid + FileSystemItem.URI_PATH_SEPARATOR + url.uri == file.relativePath } }
                .forEach { _ -> referencedFiles.add(file) }
        }
        return referencedFiles
    }

    private fun queryDocs(query: String, jsonbField: String): List<Array<Any>> {

        @Suppress("UNCHECKED_CAST")
        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField)
            .resultList as List<Array<Any>>
    }

    private data class DocUrls(val catalogId: String, val uuid: String, val urls: List<UploadInfo>)
}
