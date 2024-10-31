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

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.imports.internal.migrations.Migrate120
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

/**
 * Transform userIds of users to lowercase
 */
@Service
class M087MigrateDatasetProperties : MigrationBase("0.87") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {
        // do everything in postExec
    }

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")

            val docTypesToMigrate = """("InGridGeoDataset","InGridDataCollection","InGridGeoService","InGridInformationSystem","InGridLiterature","InGridProject","InGridSpecialisedTask")"""

            do {
                log.info("Handling page $page")
                val documents = entityManager.createQuery("""SELECT doc FROM Document doc WHERE doc.type IN $docTypesToMigrate ORDER BY id""")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                documents.forEach {
                    it as Document
                    val properties = Migrate120.getPropertiesOfDocument(it.data, it.type)
                    it.data.set<JsonNode>("properties", properties)
                    log.info("Migrated doc with dbID ${it.id}")
//                        docRepo.save(it)
                }
                page++
            } while (documents.size == pageSize)
        }
    }
}
