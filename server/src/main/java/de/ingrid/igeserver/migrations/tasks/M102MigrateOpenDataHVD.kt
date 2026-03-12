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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Profile("opendata")
@Service
class M102MigrateOpenDataHVD : MigrationBase("0.102") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        setAdminAuthentication()
        migrateDocuments()
    }

    private fun migrateDocuments() {
        val pageSize = 100
        var page = 1

        do {
            var documentsSize = 0
            ClosableTransaction(transactionManager).use {
                setAdminAuthentication("Migration", "Task")
                val documents: List<Document> =
                    entityManager.createQuery(
                        """SELECT doc FROM Document doc WHERE doc.type = 'OpenDataDoc' AND doc.state != 'ARCHIVED' ORDER BY doc.id""",
                        Document::class.java,
                    )
                        .setFirstResult((page - 1) * pageSize)
                        .setMaxResults(pageSize)
                        .resultList

                documentsSize = documents.size
                documents.forEach { migrateDocument(it) }
            }
            page++
        } while (documentsSize == pageSize)
    }

    private fun migrateDocument(doc: Document) {
        val data = doc.data

        if (data.has("isHvd")) {
            val isHvdValue = data.get("isHvd")
            val properties = if (data.has("properties") && data.get("properties").isObject) {
                data.get("properties") as ObjectNode
            } else {
                data.putObject("properties")
            }
            properties.set<JsonNode>("isHvd", isHvdValue)
            properties.put("isOpenData", true)

            data.remove("isHvd")
            log.info("Migrated isHvd property and added isOpenData for document ${doc.id}")
        }
    }
}
