package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class RemoveUnreferencedDocsTask(val storage: FileSystemStorage,
                                 val entityManager: EntityManager,
                                 val catalogRepo: CatalogRepository
) {
    
    private val log = logger()

    @PostConstruct
    fun init() = start()


    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun start() {
        
        val uvpCatalogs = catalogRepo.findAllByType("uvp")
        
        uvpCatalogs.forEach { cleanupFilesForCatalogId(it.identifier) }
        
    }
    
    
    private fun cleanupFilesForCatalogId(catalogId: String) {
        val docs = queryDocs(sqlStepsWithDrafts, "step")
        val negativeDocs = queryDocs(sqlNegativeDecisionDocsWithDraft, "negativeDocs")

        val uploads = docs.map {DocUrls(it[1] as String, it[0] as String, getUrlsFromJsonField(it[2] as JsonNode))}
        val uploadsNegative = negativeDocs.map {DocUrls(it[1] as String, it[0] as String, getUrlsFromJsonFieldTable(it[2] as JsonNode, "uvpNegativeDecisionDocs"))}
        val allUploads = uploads + uploadsNegative
        
        val publishedFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.PUBLISHED)
        val draftFiles: List<FileSystemItem> = this.storage.list(catalogId, Scope.UNPUBLISHED)

        val referencedFiles = mutableListOf<FileSystemItem>()
        
        val allFiles = publishedFiles + draftFiles
        allFiles.forEach { file ->
            allUploads
                .filter { it.catalogId == catalogId }
                .filter { file.path.startsWith(it.uuid) }
                .filter { it.urls.any { url -> url.uri == file.file} }
                .forEach { _ -> referencedFiles.add(file)}
        }
        
        val unreferencedFiles = allFiles.filter { file -> referencedFiles.none { ref -> ref.file == file.file } }
        
        log.debug("referenced files in catalog $catalogId: ${referencedFiles.size}")
        log.debug("unreferenced files in catalog $catalogId: ${unreferencedFiles.size}")
        
        
        unreferencedFiles.forEach { storage.delete(catalogId, it) }
    }

    private fun queryDocs(query: String, jsonbField: String): List<Array<Any>> {

        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField, JsonNodeBinaryType.INSTANCE)
            .resultList as List<Array<Any>>
    }

/*
    private fun deleteUnreferencedFile(item: StorageItem) {

        // delete unreferenced files
        log.debug("Deleting unreferenced files")
        var deleteCount = 0
        // get file age
        val age = LocalDateTime.from(item.lastModifiedDate).until(this.referenceDateTime, ChronoUnit.SECONDS)
        if (this.deleteFileMinAge == null || age >= this.deleteFileMinAge) {
            log.info("Deleting file: " + this.formatItem(item) + " (age: " + age + " seconds)")
            try {
                storage.delete(item.path, item.file)
                deleteCount++
            } catch (e: IOException) {
                // log error, but keep the job running
                log.error("File " + this.formatItem(item) + " could not be deleted", e)
            }
        } else {
            log.debug("Keeping file: " + this.formatItem(item) + " (age: " + age + " seconds)")
        }
        log.debug("Number of deleted files: $deleteCount")
    }
*/
    
    private data class DocUrls(val catalogId: String, val uuid: String, val urls: List<UploadInfo>)
}