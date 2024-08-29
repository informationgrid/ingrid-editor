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

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Profile("ingrid")
@Service
class M079_MigrateDigitalTransferOptions : MigrationBase("0.79") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {}

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            log.info("Start migration of DigitalTransferOptions")
            do {
                log.info("Handling page $page")
                val documents = entityManager.createQuery("""SELECT doc FROM Document doc ORDER BY id""")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                documents
                    .forEach {
                        it as Document
                        try {
                            var changed = false
                            it.data.get("digitalTransferOptions")?.forEach { options ->
                                options as ObjectNode?
                                val transferSize = options?.get("transferSize")
                                if (transferSize != null && !transferSize.isNull) {
                                    changed = true
                                    options.set<ObjectNode>(
                                        "transferSize",
                                        jacksonObjectMapper().createObjectNode().apply {
                                            put("value", transferSize.asDouble())
                                            set<ObjectNode>(
                                                "unit",
                                                jacksonObjectMapper().createObjectNode().apply {
                                                    put("key", "MB")
                                                },
                                            )
                                        },
                                    )
                                }
                            }

                            if (changed) {
                                log.info("Migrated doc with dbID ${it.id}")
                                docRepo.save(it)
                            }
                        } catch (ex: Exception) {
                            log.error("Error migrating document with dbID ${it.id}", ex)
                        }
                    }
                page++
            } while (documents.size == pageSize)
        }
    }
}
