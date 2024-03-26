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
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M062_MigrateProcessStepType : MigrationBase("0.62") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc, Catalog cat").resultList
            setAdminAuthentication("Migration", "Task")

            docs.forEach { doc ->
                doc as Document
                try {
                    if (doc.type == "InGridGeoDataset" ) {
                        if (migrateProcessStep(doc)) {
                            log.info("Migrated doc with dbID ${doc.id}")
                            docRepo.save(doc)
                        }
                    }
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun migrateProcessStep(doc: Document): Boolean {
        val processStep: ObjectNode = doc.data.get("dataQualityInfo")?.get("lineage")?.get("source")?.get("processStep") as ObjectNode? ?: return false
        val description = processStep.get("description")?.textValue() ?: return false




        val newStructure = jacksonObjectMapper().createArrayNode().apply {
            add(jacksonObjectMapper().createObjectNode().apply {
                putNull("key")
                put("value", description)
            })
        }

        processStep.set<ObjectNode>("description", newStructure)
        return true
    }
}
