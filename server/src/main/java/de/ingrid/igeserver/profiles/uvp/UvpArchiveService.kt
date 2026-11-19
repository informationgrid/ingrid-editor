/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.profiles.uvp.tasks.ArchiveType
import de.ingrid.igeserver.profiles.uvp.tasks.sqlDecisionDateBefore
import de.ingrid.igeserver.profiles.uvp.tasks.sqlUpdateValidDate
import de.ingrid.igeserver.profiles.uvp.tasks.sqlUpdateValidDateNegativeDoc
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import java.time.OffsetDateTime

data class WrapperAndDocId(val wrapperId: Int, val docId: Int, val docType: String)

@Service
class UvpArchiveService(val entityManager: EntityManager, val transactionManager: PlatformTransactionManager) {

    val log = logger()

    @Suppress("UNCHECKED_CAST")
    fun getDatasetsBeforeDecisionDate(catalogId: String, date: OffsetDateTime): List<WrapperAndDocId> = entityManager.createNativeQuery(
        sqlDecisionDateBefore(catalogId, date),
        WrapperAndDocId::class.java,
    ).resultList as List<WrapperAndDocId>

    fun updateValidUntilDate(
        datasets: List<WrapperAndDocId>,
        type: ArchiveType,
    ) {
        ClosableTransaction(transactionManager).use {
            // modify valid date for documents according to selected option
            when (type) {
                // modify valid date for all documents
                ArchiveType.HIDE_ALL -> updateDocuments(datasets, UvpDocumentReferences.PROCESSING_STEP_TABLE_FIELDS)

                // do nothing
                ArchiveType.SHOW_ALL -> {}

                // modify valid date for all documents but decision docs
                ArchiveType.SHOW_ONLY_DECISION ->
                    updateDocuments(datasets, UvpDocumentReferences.NON_DECISION_PROCESSING_STEP_TABLE_FIELDS)
            }
        }
    }

    fun mapType(type: String?): String = when (type) {
        "hideAll" -> ArchiveType.HIDE_ALL.name
        "showOnlyDecision" -> ArchiveType.SHOW_ONLY_DECISION.name
        else -> ArchiveType.SHOW_ALL.name
    }

    private fun updateDocuments(datasets: List<WrapperAndDocId>, tableIds: List<String>) {
        datasets.forEach { dataset ->
            if (dataset.docType == "UvpNegativePreliminaryAssessmentDoc") {
                log.debug("Updating valid date for negative decision document ${dataset.docId}")
                entityManager.createNativeQuery(sqlUpdateValidDateNegativeDoc(dataset.docId)).executeUpdate()
            } else {
                tableIds.forEach { tableId ->
                    log.debug("Updating valid date for table $tableId for document ${dataset.docId}")
                    entityManager.createNativeQuery(sqlUpdateValidDate(dataset.docId, tableId)).executeUpdate()
                }
            }
        }
    }
}
