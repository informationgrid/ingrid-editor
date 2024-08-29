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
import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M080_UpdateInGridLiteratureName : MigrationBase("0.80") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var queryRepo: QueryRepository
    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            updateDocuments()
            updateQueries()
        }
    }

    private fun updateDocuments() {
        val sql = """
                
                UPDATE document
                SET type = 'InGridPublication'
                WHERE type = 'InGridLiterature';
                
                UPDATE document_wrapper
                SET type = 'InGridPublication'
                WHERE type = 'InGridLiterature';
                
        """.trimIndent()

        entityManager.createNativeQuery(sql).executeUpdate()
    }

    private fun updateQueries() {
        val pageSize = 100
        var page = 1

        do {
            log.info("Handling page $page")
            val queries = entityManager.createQuery("SELECT savedQuery FROM Query savedQuery  ")
                .setFirstResult((page - 1) * pageSize).setMaxResults(pageSize).resultList

            queries.map { it as Query }.forEach {
                try {
                    val objectMapper = ObjectMapper()
                    val jsonString = it.data.toString()
                    if (jsonString.contains("InGridLiterature")) {
                        val updatedJsonString = jsonString.replace("InGridLiterature", "InGridPublication")
                        val updatedData: JsonNode = objectMapper.readTree(updatedJsonString)
                        it.data = updatedData
                        queryRepo.save(it)
                        log.info("Migrated query with dbID ${it.id}")
                    }
                } catch (ex: Exception) {
                    log.error("Error migrating query with dbID ${it.id}", ex)
                }
            }
            page++
        } while (queries.size == pageSize)
    }
}
