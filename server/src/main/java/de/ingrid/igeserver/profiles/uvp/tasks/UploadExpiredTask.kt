package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import javax.annotation.PostConstruct
import javax.persistence.EntityManager

@Profile("uvp")
@Component
class UploadExpiredTask(
    val fileSystemStorage: FileSystemStorage,
    val entityManager: EntityManager
) {
    val log = logger()
    
    @PostConstruct
    fun init() = start()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun scheduleStart() {
        log.info("Starting Upload-Expired - Task")
        start(null)
    }
    
    fun start(docId: Int? = null) {
        val docs = try {
            getPublishedDocumentsByCatalog(docId)
        } catch (e: Exception) {
            log.error("Error getting published documents, which can be normal if database is empty: ${e.message}")
            emptyList()
        }

        docs.forEach {
            // remove expired documents
            archiveExpiredUvpFiles(it)

            // restore expired documents
            restoreUvpFiles(it)
        }
    }

    private fun restoreUvpFiles(uploads: PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestValidUntilDate()
            .filter { !isExpired(it, today) }
            .filter { fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .forEach {
                log.info("Restore file ${it.uri} from ${uploads.docUuid}")
                fileSystemStorage.restore(uploads.catalogId, uploads.docUuid, it.uri)
            }
    }

    private fun archiveExpiredUvpFiles(uploads: PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestValidUntilDate()
            .filter { isExpired(it, today) }
            .filter { !fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .forEach {archiveFile(it, uploads)}
    }

    private fun archiveFile(
        uploadInfo: UploadInfo,
        uploads: PublishedUploads
    ) {
        try {
            log.info("Archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
            fileSystemStorage.archive(uploads.catalogId, uploads.docUuid, uploadInfo.uri)
        } catch (ex: Exception) {
            log.error("Could not archive file ${uploadInfo.uri} from ${uploads.docUuid} in catalog ${uploads.catalogId}")
        }
    }

    private fun isExpired(upload: UploadInfo, today: LocalDate) =
        upload.validUntil != null && today.isAfter(OffsetDateTime.parse(upload.validUntil).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate())

    private fun getPublishedDocumentsByCatalog(docId: Int?): List<PublishedUploads> {
        val result = queryDocs(sqlStepsPublished, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", docId)

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

    private fun queryDocs(sql: String, jsonbField: String, filterByDocId: Int?): List<Array<Any>> {
        val query = if (filterByDocId == null) sql else "$sql AND doc.id = $filterByDocId"
        
        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField, JsonNodeBinaryType.INSTANCE)
            .resultList as List<Array<Any>>
    }


    private data class PublishedUploads(val catalogId: String, val docUuid: String, val docs: List<UploadInfo>) {
        fun getDocsByLatestValidUntilDate(): List<UploadInfo> {
            val response = mutableListOf<UploadInfo>()
            docs.forEach { doc ->
                val found = response.find { it.uri == doc.uri }
                if (found == null) response.add(doc)
                else {
                    if (found.validUntil != null) {
                        val date1 = LocalDate.parse(found.validUntil, DateTimeFormatter.ISO_DATE_TIME)
                        val date2 = if (doc.validUntil == null) null else LocalDate.parse(
                            doc.validUntil,
                            DateTimeFormatter.ISO_DATE_TIME
                        )
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
}
