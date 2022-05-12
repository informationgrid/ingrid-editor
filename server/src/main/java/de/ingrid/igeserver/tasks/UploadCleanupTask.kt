package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.nio.file.Paths
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.annotation.PostConstruct
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class UploadCleanupTask(
    val fileSystemStorage: FileSystemStorage,
    val catalogRepo: CatalogRepository,
    val documentWrapperRepo: DocumentWrapperRepository,
    val entityManager: EntityManager
) {
    val log = logger()

    val sqlSteps = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.published = doc.id;
    """.trimIndent()

    val sqlNegativeDecisionDocs = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.published = doc.id
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL;
    """.trimIndent()

    @PostConstruct
    fun init() {
        cleanup()
    }

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun cleanup() {
        log.debug("Starting Upload-Cleanup - Task")
        val docsDir = fileSystemStorage.docsDir

        val trashPath = Paths.get(docsDir, FileSystemStorage.TRASH_PATH)
        val archivePath = Paths.get(docsDir, FileSystemStorage.ARCHIVE_PATH)
        val unsavedPath = Paths.get(docsDir, FileSystemStorage.UNSAVED_PATH)
        val unpublishedPath = Paths.get(docsDir, FileSystemStorage.UNPUBLISHED_PATH)

        // Delete old unsaved Files
        fileSystemStorage.deleteUnsavedFiles(unsavedPath)

        // Delete old Trash Files
        fileSystemStorage.deleteTrashFiles(trashPath)

        // run as long as there are empty directories
        fileSystemStorage.deleteEmptyDirs(trashPath, archivePath, unsavedPath, unpublishedPath)

        val docs = getPublishedDocumentsByCatalog()


        docs.forEach {
            // remove expired documents
            archiveExpiredUvpFiles(it)

            // restore expired documents

            // remove unreferenced documents
//            deleteUnreferencedUvpFilesFromCatalog(it)
        }
    }

    private fun archiveExpiredUvpFiles(uploads: PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestExpiryDate()
            .filter { isExpired(it, today) }
            .forEach {
                log.info("Archive file ${it.uri} from ${uploads.docUuid}")
                // fileSystemStorage.archive(uploads.catalogId, uploads.docUuid, it.uri)
            }
    }

    private fun isExpired(upload: UploadInfo, today: LocalDate) =
        upload.expiredDate != null && LocalDate.parse(upload.expiredDate, DateTimeFormatter.ISO_DATE_TIME).isBefore(today)

    private fun getPublishedDocumentsByCatalog(): List<PublishedUploads> {
        val result = queryDocs(sqlSteps, "step")
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocs, "negativeDocs")

        val stepUrls =
            result.map { PublishedUploads(it[1].toString(), it[0].toString(), getUrlsFromJsonField(it[2] as JsonNode)) }
        val negativeUrls = resultNegativeDocs.map {
            PublishedUploads(
                it[1].toString(),
                it[0].toString(),
                getUrlsFromJsonFieldTable(it[2] as JsonNode, "uvpNegativeDecisionDocs")
            )
        }

        return stepUrls + negativeUrls
    }

    private fun getUrlsFromJsonField(json: JsonNode): List<UploadInfo> {
        return (getUrlsFromJsonFieldTable(json, "applicationDocs")
                + getUrlsFromJsonFieldTable(json, "announcementDocs")
                + getUrlsFromJsonFieldTable(json, "reportsRecommendationDocs")
                + getUrlsFromJsonFieldTable(json, "furtherDocs")
                + getUrlsFromJsonFieldTable(json, "considerationDocs")
                + getUrlsFromJsonFieldTable(json, "approvalDocs")
                + getUrlsFromJsonFieldTable(json, "decisionDocs")
                )
    }

    private fun getUrlsFromJsonFieldTable(json: JsonNode, tableField: String): List<UploadInfo> {
        return json.get(tableField)
            ?.filter { !it.get("downloadURL").get("asLink").asBoolean() }
            ?.map { mapToUploadInfo(it) }
            ?: emptyList()
    }

    private fun mapToUploadInfo(it: JsonNode): UploadInfo {
        val expiryDateField = it.get("expiryDate")
        val expiredDate = if (expiryDateField == null || expiryDateField.isNull) null else expiryDateField.asText()
        return UploadInfo(it.get("downloadURL").get("uri").textValue(), expiredDate)
    }

    private fun queryDocs(sql: String, jsonbField: String): List<Array<Any>> =
        entityManager.createNativeQuery(sql).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField, JsonNodeBinaryType.INSTANCE)
            .resultList as List<Array<Any>>

    private fun deleteUnreferencedUvpFilesFromCatalog(docs: PublishedDocs) {
        docs.catalogId
    }

    private fun getPublishedDocumentsFromCatalog(catalogIdentifier: String): PublishedDocs {
        val publishedDocs = documentWrapperRepo
            .findAllByCatalog_IdentifierAndCategory(catalogIdentifier, DocumentCategory.DATA.value)
            .mapNotNull { it.published }

        return PublishedDocs(catalogIdentifier, publishedDocs)
    }

}

private data class PublishedDocs(val catalogId: String, val docs: List<Document>)
private data class UploadInfo(val uri: String, val expiredDate: String?)
private data class PublishedUploads(val catalogId: String, val docUuid: String, val docs: List<UploadInfo>) {
    fun getDocsByLatestExpiryDate(): List<UploadInfo> {
        val response = mutableListOf<UploadInfo>()
        docs.forEach { doc ->
            val found = response.find { it.uri == doc.uri }
            if (found == null) response.add(doc)
            else {
                if (found.expiredDate != null) {
                    val date1 = LocalDate.parse(found.expiredDate, DateTimeFormatter.ISO_DATE_TIME)
                    val date2 = if (doc.expiredDate == null) null else LocalDate.parse(doc.expiredDate, DateTimeFormatter.ISO_DATE_TIME)
                    if (date2 == null || date2.isAfter(date1)) {
                        response.remove(found)
                        response.add(doc)
                    }
                }
            }
        }
        return response
    }
}
