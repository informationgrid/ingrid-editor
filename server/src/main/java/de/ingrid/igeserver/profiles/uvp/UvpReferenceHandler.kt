package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.UploadInfo
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class UvpReferenceHandler @Autowired constructor(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    override fun getProfile() = UvpProfile.id


    val sqlStepsDraftAndPending = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
    """.trimIndent()

    val sqlNegativeDecisionDocsDraftAndPending = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

    fun getPublishedDocumentsByCatalog(docId: Int? = null): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", docId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    fun getDraftAndPendingDocumentsByCatalog(docId: Int? = null): List<DocumentLinks> {
        val result = queryDocs(sqlStepsDraftAndPending, "step", docId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsDraftAndPending, "negativeDocs", docId)
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
        val uniqueList = mutableListOf<DocumentLinks>()
        // TODO: logic in both forEachs almost the same
        result.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonField(it[2] as JsonNode, onlyLinks),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(it[2] as JsonNode, onlyLinks))
            }
        }
        resultNegativeDocs.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonFieldTable(
                            it[2] as JsonNode,
                            "uvpNegativeDecisionDocs",
                            onlyLinks
                        ).toMutableList(),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(it[2] as JsonNode, onlyLinks))
            }
        }

        return uniqueList
    }

    private fun getUrlsFromJsonField(json: JsonNode, onlyLinks: Boolean = false): MutableList<UploadInfo> {
        return (getUrlsFromJsonFieldTable(json, "applicationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "announcementDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "reportsRecommendationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "furtherDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "considerationDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "approvalDocs", onlyLinks)
                + getUrlsFromJsonFieldTable(json, "decisionDocs", onlyLinks)
                ).toMutableList()
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

}
