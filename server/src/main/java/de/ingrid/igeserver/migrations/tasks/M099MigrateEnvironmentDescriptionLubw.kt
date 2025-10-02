/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Profile("ingrid-lubw")
@Service
class M099MigrateEnvironmentDescriptionLubw : MigrationBase("0.99") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var codelistHandler: CodelistHandler

    override fun exec() {}

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            do {
                val documents =
                    entityManager.createQuery("""SELECT doc FROM Document doc WHERE doc.catalog.type="ingrid-lubw" AND doc.state != "ARCHIVED" ORDER BY id""")
                        .setFirstResult((page - 1) * pageSize)
                        .setMaxResults(pageSize)
                        .resultList

                documents
                    .forEach {
                        (it as Document)
                        val changed = migrate(it)
                        if (changed) {
                            log.info("Migrated doc with dbID ${it.id}")
                            docRepo.save(it)
                        }
                    }
                page++
            } while (documents.size == pageSize)
        }
    }

    private fun migrate(doc: Document?): Boolean {
        val environmentDescription = doc?.data?.getString("dataQualityInfo.lineage.source.environmentDescription")
        val catalogId = doc?.catalog?.identifier!!

        if (environmentDescription != null) {
            val path = doc.data.getPath("dataQualityInfo.lineage.source") as ObjectNode
            path.set<ObjectNode>(
                "environmentDescription",
                jacksonObjectMapper().createObjectNode().apply {
                    val key = codelistHandler.getCatalogCodelistKey(catalogId, "30001", environmentDescription, "de")
                    put("key", key)
                    put("value", environmentDescription)
                    put("_codelistId", "30001")
                    log.info("Migrate 'environmentDescription' to KeyValue: $environmentDescription -> $key")
                },
            )
            return true
        } else {
            return false
        }
    }
}
