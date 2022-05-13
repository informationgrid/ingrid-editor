package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
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
          AND dw.published = doc.id
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
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

    @Scheduled(cron = "\${upload.cleanup.schedule}")
    fun scheduleStart() {
        log.info("Starting Upload-Expired - Task")
        start(null)
    }
    
    fun start(docId: Int? = null) {
        val docs = getPublishedDocumentsByCatalog(docId)

        docs.forEach {
            // remove expired documents
            archiveExpiredUvpFiles(it)

            // restore expired documents
            restoreUvpFiles(it)

            // remove unreferenced documents
//            deleteUnreferencedUvpFilesFromCatalog(it)
        }
    }

    private fun restoreUvpFiles(uploads: PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestExpiryDate()
            .filter { !isExpired(it, today) }
            .filter { fileSystemStorage.isArchived(uploads.catalogId, uploads.docUuid, it.uri) }
            .forEach {
                log.info("Restore file ${it.uri} from ${uploads.docUuid}")
                fileSystemStorage.restore(uploads.catalogId, uploads.docUuid, it.uri)
            }
    }

    private fun archiveExpiredUvpFiles(uploads: PublishedUploads) {
        val today = LocalDate.now()
        uploads.getDocsByLatestExpiryDate()
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
        upload.expiredDate != null && LocalDate.parse(upload.expiredDate, DateTimeFormatter.ISO_DATE_TIME)
            .isBefore(today)

    private fun getPublishedDocumentsByCatalog(docId: Int?): List<PublishedUploads> {
        val result = queryDocs(sqlSteps, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocs, "negativeDocs", docId)

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

    private fun queryDocs(sql: String, jsonbField: String, filterByDocId: Int?): List<Array<Any>> {
        val query = if (filterByDocId == null) sql else "$sql AND doc.id = $filterByDocId"
        
        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField, JsonNodeBinaryType.INSTANCE)
            .resultList as List<Array<Any>>
    }


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
                        val date2 = if (doc.expiredDate == null) null else LocalDate.parse(
                            doc.expiredDate,
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
