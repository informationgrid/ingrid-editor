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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.DEFAULT_MIGRATION_BATCH_SIZE
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.migrations.forEachDocumentBatch
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import tools.jackson.databind.node.ArrayNode

@Service
class M105RemoveADVCodelistEntry : MigrationBase("0.105") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")

            entityManager.forEachDocumentBatch(
                DEFAULT_MIGRATION_BATCH_SIZE,
                { lastId ->
                    @Suppress("UNCHECKED_CAST")
                    entityManager.createNativeQuery(
                        """SELECT * FROM document doc
                           WHERE doc.data -> 'advProductGroups' @> '[{"key": "24"}]'
                             AND doc.id > :lastId
                           ORDER BY doc.id""",
                        Document::class.java,
                    )
                        .setParameter("lastId", lastId)
                        .setMaxResults(DEFAULT_MIGRATION_BATCH_SIZE)
                        .resultList as List<Document>
                },
            ) {
                if (removeADVKeyword(it)) {
                    log.info("Removed ADV Category 'INSPIRE Boden' for doc with dbID ${it.id}")
                    docRepo.save(it)
                }
            }
        }
    }

    private fun removeADVKeyword(doc: Document): Boolean {
        val advGroups = doc.data.get("advProductGroups") as? ArrayNode ?: return false

        val previousLength = advGroups.size()
        // Remove ADV keyword "INSPIRE Boden" with key "24"
        advGroups.removeIf { it.getString("key") == "24" }

        return previousLength != advGroups.size()
    }
}
