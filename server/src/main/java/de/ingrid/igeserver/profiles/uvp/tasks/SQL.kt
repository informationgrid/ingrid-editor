package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.utils.UploadInfo

val sqlStepsPublished = """
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
          AND doc.state = 'PUBLISHED'
    """.trimIndent()

val sqlStepsWithDrafts = """
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
          AND (doc.state = 'PUBLISHED' OR doc.state = 'DRAFT' OR doc.state = 'DRAFT_AND_PUBLISHED' OR doc.state = 'PENDING')
    """.trimIndent()

val sqlNegativeDecisionDocsPublished = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state = 'PUBLISHED'
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

val sqlNegativeDecisionDocsWithDraft = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND (doc.state = 'PUBLISHED' OR doc.state = 'DRAFT' OR doc.state = 'DRAFT_AND_PUBLISHED' OR doc.state = 'PENDING')
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

fun getUrlsFromJsonField(json: JsonNode): List<UploadInfo> {
    return (getUrlsFromJsonFieldTable(json, "applicationDocs")
            + getUrlsFromJsonFieldTable(json, "announcementDocs")
            + getUrlsFromJsonFieldTable(json, "reportsRecommendationDocs")
            + getUrlsFromJsonFieldTable(json, "furtherDocs")
            + getUrlsFromJsonFieldTable(json, "considerationDocs")
            + getUrlsFromJsonFieldTable(json, "approvalDocs")
            + getUrlsFromJsonFieldTable(json, "decisionDocs")
            )
}

fun getUrlsFromJsonFieldTable(json: JsonNode, tableField: String): List<UploadInfo> {
    return json.get(tableField)
        ?.filter { !it.get("downloadURL").get("asLink").asBoolean() }
        ?.map { mapToUploadInfo(it) }
        ?: emptyList()
}

private fun mapToUploadInfo(it: JsonNode): UploadInfo {
    val validUntilDateField = it.get("validUntil")
    val expiredDate = if (validUntilDateField == null || validUntilDateField.isNull) null else validUntilDateField.asText()
    return UploadInfo("", it.get("downloadURL").get("uri").textValue(), expiredDate)
}
