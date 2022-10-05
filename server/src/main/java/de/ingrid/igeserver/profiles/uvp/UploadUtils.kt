package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager

@Service
class UploadUtils @Autowired constructor(val entityManager: EntityManager) {

    val sqlSteps = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
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
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
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
    
    val sqlStepsDraft = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.draft = doc.id
    """.trimIndent()

    val sqlNegativeDecisionDocsDraft = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.draft = doc.id
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

    fun getPublishedDocumentsByCatalog(docId: Int? = null): List<PublishedUploads> {
        val result = queryDocs(sqlSteps, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocs, "negativeDocs", docId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    fun getDraftDocumentsByCatalog(docId: Int? = null): List<PublishedUploads> {
        val result = queryDocs(sqlStepsDraft, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsDraft, "negativeDocs", docId)
        return mapQueryResults(result, resultNegativeDocs)
    }
    
    private fun mapQueryResults(result: List<Array<Any>>, resultNegativeDocs: List<Array<Any>>): List<PublishedUploads> {
        val stepUrls =
            result.map {
                PublishedUploads(
                    it[1].toString(),
                    it[0].toString(),
                    getUrlsFromJsonField(it[2] as JsonNode)
                )
            }
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
        val validUntilDateField = it.get("validUntil")
        val expiredDate =
            if (validUntilDateField == null || validUntilDateField.isNull) null else validUntilDateField.asText()
        return UploadInfo(it.get("downloadURL").get("uri").textValue(), expiredDate)
    }

    data class UploadInfo(val uri: String, val validUntil: String?)

    data class PublishedUploads(val catalogId: String, val docUuid: String, val docs: List<UploadInfo>) {
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