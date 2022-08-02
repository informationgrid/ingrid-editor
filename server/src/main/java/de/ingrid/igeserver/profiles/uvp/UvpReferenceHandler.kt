package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class UvpReferenceHandler @Autowired constructor(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    override fun getProfile() = UvpProfile.id


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

    fun getPublishedDocumentsByCatalog(docId: Int? = null): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", docId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    fun getDraftDocumentsByCatalog(docId: Int? = null): List<DocumentLinks> {
        val result = queryDocs(sqlStepsDraft, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsDraft, "negativeDocs", docId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    override fun getURLsFromCatalog(catalogId: String): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", null, catalogId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", null, catalogId)
        return mapQueryResults(result, resultNegativeDocs, true)
    }

    private fun mapQueryResults(
        result: List<Array<Any>>,
        resultNegativeDocs: List<Array<Any>>,
        onlyLinks: Boolean = false
    ): List<DocumentLinks> {
        val stepUrls =
            result.map {
                DocumentLinks(
                    it[1].toString(),
                    it[0].toString(),
                    getUrlsFromJsonField(it[2] as JsonNode, onlyLinks),
                    it[3].toString(),
                    it[4].toString()
                )
            }
        val negativeUrls = resultNegativeDocs.map {
            DocumentLinks(
                it[1].toString(),
                it[0].toString(),
                getUrlsFromJsonFieldTable(it[2] as JsonNode, "uvpNegativeDecisionDocs", onlyLinks),
                it[3].toString(),
                it[4].toString()
            )
        }

        return stepUrls + negativeUrls
    }

    private fun queryDocs(
        sql: String,
        jsonbField: String,
        filterByDocId: Int?,
        catalogId: String? = null
    ): List<Array<Any>> {
        var query = if (filterByDocId == null) sql else "$sql AND doc.id = $filterByDocId"
        if (catalogId != null) query = "$sql AND catalog.identifier = '$catalogId'"

        @Suppress("UNCHECKED_CAST")
        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField, JsonNodeBinaryType.INSTANCE)
            .addScalar("title")
            .addScalar("type")
            .resultList as List<Array<Any>>
    }

    private fun getUrlsFromJsonField(json: JsonNode, onlyLinks: Boolean = false): List<UploadInfo> {
        return (getUrlsFromJsonFieldTable(json, "applicationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "announcementDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "reportsRecommendationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "furtherDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "considerationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "approvalDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "decisionDocs", onlyLinks)
                )
    }

    private fun getUrlsFromJsonFieldTable(
        json: JsonNode,
        tableField: String,
        onlyLinks: Boolean = false
    ): List<UploadInfo> {
        return json.get(tableField)
            ?.filter { it.get("downloadURL").get("asLink").asBoolean() == onlyLinks }
            ?.map { mapToUploadInfo(tableField, it) }
            ?: emptyList()
    }

    private fun mapToUploadInfo(field: String, it: JsonNode): UploadInfo {
        val validUntilDateField = it.get("validUntil")
        val expiredDate =
            if (validUntilDateField == null || validUntilDateField.isNull) null else validUntilDateField.asText()
        return UploadInfo(field, it.get("downloadURL").get("uri").textValue(), expiredDate)
    }

    data class UploadInfo(val fromField: String, val uri: String, val validUntil: String?)

}
