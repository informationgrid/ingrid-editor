/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.UploadInfo
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class UvpReferenceHandler(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    override fun getProfile() = UvpProfile.id

    override val urlFields = listOf("uri")

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

    override fun getURLsFromCatalog(catalogId: String, groupDocIds: List<Int>, profile: String): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", null, catalogId, groupDocIds = groupDocIds)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", null, catalogId, groupDocIds = groupDocIds)
        return mapQueryResults(result, resultNegativeDocs, true)
    }

    private fun mapQueryResults(
        result: List<Array<Any?>>,
        resultNegativeDocs: List<Array<Any?>>,
        onlyLinks: Boolean = false
    ): List<DocumentLinks> {
        val uniqueList = mutableListOf<DocumentLinks>()
        // TODO: logic in both forEachs almost the same
        result.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            val data = jacksonObjectMapper().readTree(it[2].toString())
            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonField(data, onlyLinks),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(data, onlyLinks))
            }
        }
        resultNegativeDocs.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            val data = jacksonObjectMapper().readTree(it[2].toString())
            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonFieldTable(
                            data,
                            "uvpNegativeDecisionDocs",
                            onlyLinks
                        ).toMutableList(),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(data, onlyLinks))
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
            ?.mapNotNull { mapToUploadInfo(tableField, it) }
            ?: emptyList()
    }

    private fun mapToUploadInfo(field: String, it: JsonNode): UploadInfo? {
        val validUntilDateField = it.get("validUntil")
        val expiredDate =
            if (validUntilDateField == null || validUntilDateField.isNull) null else validUntilDateField.asText()
        val uri = it.get("downloadURL")?.get("uri")?.textValue() ?: return null
        return UploadInfo(field, uri, expiredDate)
    }
    
    private data class UrlTableFields(
            val applicationDocs: List<TableDef>?,
            val announcementDocs: List<TableDef>?,
            val reportsRecommendationDocs: List<TableDef>?,
            val furtherDocs: List<TableDef>?,
            val considerationDocs: List<TableDef>?,
            val approvalDocs: List<TableDef>?,
            val decisionDocs: List<TableDef>?,
    )
    
    private data class TableDef(val downloadUrl: UrlDef, val validUntil: String?)
    private data class UrlDef(val asLink: Boolean, val uri: String)

}
