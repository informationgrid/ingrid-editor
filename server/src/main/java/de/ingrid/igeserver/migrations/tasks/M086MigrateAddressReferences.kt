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
import de.ingrid.igeserver.migrations.MigrationBase
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

/**
 * Transform userIds of users to lowercase
 */
@Service
class M086MigrateAddressReferences : MigrationBase("0.86") {

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

            do {
                log.info("Handling page $page")
                val documents = entityManager.createQuery("""SELECT doc FROM Document doc WHERE doc.state != 'ARCHIVED' ORDER BY id""")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                documents
                    .forEach {
                        val type = (it as Document).catalog!!.type
                        val addressField = if (type == "uvp" || type.startsWith("ingrid")) "pointOfContact" else "addresses"
                        val changed = migratePointOfContact(it, addressField)
                        if (changed) {
                            log.info("Migrated doc with dbID ${it.id}")
                            docRepo.save(it)
                        }
                    }
                page++
            } while (documents.size == pageSize)
        }
    }

    private fun migratePointOfContact(doc: Document?, field: String): Boolean {
        val addresses = doc?.data?.get(field)
        if (addresses == null || addresses.isNull) return false
        var changed = false

        addresses.forEach {
            val uuidInObject = it.getString("ref._uuid")
            if (uuidInObject != null) {
                log.info("The following address is stored wrong in doc '${doc.uuid}': $uuidInObject")
                changed = true
                log.info("Before: $addresses")
                (it as ObjectNode).apply {
                    put("ref", uuidInObject)
                }
                log.info(" After: $addresses")
            }
        }

        return changed
    }
}
