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

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M045_MigrateUVPNumber : MigrationBase("0.45") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc WHERE doc.catalog.type='uvp'").resultList
            setAdminAuthentication("Migration", "Task")

            docs.forEach { doc ->
                doc as Document
                try {
                    migrateUvpNumber(doc)
                    docRepo.save(doc)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun migrateUvpNumber(doc: Document) {
        val value = doc.data.get("eiaNumber")
        if (value != null && !value.isNull) {
            val array = jacksonObjectMapper().createArrayNode().add(value)
            doc.data.set<ArrayNode>("eiaNumber", array)
        }
    }
}
