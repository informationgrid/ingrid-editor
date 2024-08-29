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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M059RefactorDocumentWrapper : MigrationBase("0.59") {
    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val allWrapper = """SELECT published, draft, pending, id FROM document_wrapper"""
    private val updateDocument = """UPDATE document SET is_latest=?1, state=?2 WHERE id=?3"""

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val wrappers: MutableList<Any?> = entityManager.createNativeQuery(allWrapper).resultList

            setAdminAuthentication("Migration", "Task")

            wrappers.forEach { wrapper ->
                try {
                    val obj = wrapper as Array<*>
                    migrateWrapper(obj[0] as Int?, obj[1] as Int?, obj[2] as Int?)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${(wrapper as Array<*>)[3]}", ex)
                }
            }
        }
    }

    private fun migrateWrapper(publishedId: Int?, draftId: Int?, pendingId: Int?) {
        if (draftId != null) {
            val state = if (publishedId != null) DocumentState.DRAFT_AND_PUBLISHED else DocumentState.DRAFT
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, true)
                .setParameter(2, state.toString())
                .setParameter(3, draftId)
                .executeUpdate()
        }

        if (publishedId != null) {
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, draftId == null)
                .setParameter(2, DocumentState.PUBLISHED.toString())
                .setParameter(3, publishedId)
                .executeUpdate()
        }

        if (pendingId != null) {
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, true)
                .setParameter(2, DocumentState.PENDING.toString())
                .setParameter(3, pendingId)
                .executeUpdate()
        }
    }
}
