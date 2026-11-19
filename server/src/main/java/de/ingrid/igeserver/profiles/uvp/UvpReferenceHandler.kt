/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.UploadInfo
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import tools.jackson.module.kotlin.jacksonObjectMapper

@Service
class UvpReferenceHandler(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    private val objectMapper = jacksonObjectMapper()

    override fun getProfile() = UvpProfile.ID

    override val urlFields = listOf("uri")

    val sqlStepsDraftAndPending = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
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
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
    """.trimIndent()

    fun getPublishedDocumentsByCatalog(docId: Int? = null, catalogId: String? = null): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", docId, catalogId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsPublished, "negativeDocs", docId, catalogId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    fun getDraftAndPendingDocumentsByCatalog(docId: Int? = null, catalogId: String): List<DocumentLinks> {
        val result = queryDocs(sqlStepsDraftAndPending, "step", docId, catalogId)
        val resultNegativeDocs = queryDocs(sqlNegativeDecisionDocsDraftAndPending, "negativeDocs", docId, catalogId)
        return mapQueryResults(result, resultNegativeDocs)
    }

    override fun getURLsFromCatalog(catalogId: String, groupDocIds: List<Int>, profile: String): List<DocumentLinks> {
        val result = queryDocs(sqlStepsPublished, "step", null, catalogId, groupDocIds = groupDocIds)
        val resultNegativeDocs = queryDocs(
            sqlNegativeDecisionDocsPublished,
            "negativeDocs",
            null,
            catalogId,
            groupDocIds = groupDocIds,
        )
        return mapQueryResults(result, resultNegativeDocs, true)
    }

    private fun mapQueryResults(
        result: List<Array<Any?>>,
        resultNegativeDocs: List<Array<Any?>>,
        onlyLinks: Boolean = false,
    ): List<DocumentLinks> {
        val uniqueDocuments = linkedMapOf<Pair<String, String>, DocumentLinks>()
        result.forEach {
            val data = objectMapper.readTree(it[2].toString())
            val extraction = UvpDocumentReferences.extractProcessingStep(data)
            logDiagnostics(it, extraction)
            mergeDocument(uniqueDocuments, it, selectReferences(extraction.references, onlyLinks))
        }
        resultNegativeDocs.forEach {
            val data = objectMapper.readTree(it[2].toString())
            val extraction = UvpDocumentReferences.extractNegativeDecision(data)
            logDiagnostics(it, extraction)
            mergeDocument(uniqueDocuments, it, selectReferences(extraction.references, onlyLinks))
        }

        return uniqueDocuments.values.toList()
    }

    private fun logDiagnostics(row: Array<Any?>, extraction: UvpDocumentReferences.ExtractionResult) {
        if (extraction.diagnostics.isEmpty()) return

        log.warn(
            "Could not fully extract UVP document references for catalog '${row[CATALOG_ID_COLUMN_INDEX]}' " +
                "and document '${row[UUID_COLUMN_INDEX]}' ('${row[TITLE_COLUMN_INDEX]}'): " +
                extraction.diagnostics.joinToString(),
        )
    }

    private fun selectReferences(
        references: List<UvpDocumentReferences.Reference>,
        onlyLinks: Boolean,
    ): MutableList<UploadInfo> = references
        .filter { it.isExternalLink == onlyLinks }
        .map { UploadInfo(it.tableField, it.uri, it.validUntil) }
        .toMutableList()

    private fun mergeDocument(
        uniqueDocuments: MutableMap<Pair<String, String>, DocumentLinks>,
        row: Array<Any?>,
        references: List<UploadInfo>,
    ) {
        val catalogId = row[CATALOG_ID_COLUMN_INDEX].toString()
        val docUuid = row[UUID_COLUMN_INDEX].toString()
        val key = catalogId to docUuid
        val existingDoc = uniqueDocuments[key]
        if (existingDoc == null) {
            uniqueDocuments[key] = DocumentLinks(
                catalogId,
                docUuid,
                references.toMutableList(),
                row[TITLE_COLUMN_INDEX].toString(),
                row[TYPE_COLUMN_INDEX].toString(),
            )
        } else {
            existingDoc.docs.addAll(references)
        }
    }

    private companion object {
        const val UUID_COLUMN_INDEX = 0
        const val CATALOG_ID_COLUMN_INDEX = 1
        const val TITLE_COLUMN_INDEX = 3
        const val TYPE_COLUMN_INDEX = 4
    }
}
