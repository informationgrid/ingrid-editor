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
 * Iterate though references and add referenceType depending on presents of field "url" or "uuidRef"
 */
@Service
class M090MigrateReferencesReferenceType : MigrationBase("0.90") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {
        log.info("Executing migration 0.90")
    }

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")

            do {
                log.info("Handling page $page, (migrate references)")
                val documents = entityManager.createQuery("""SELECT doc FROM Document doc WHERE doc.state != 'ARCHIVED' ORDER BY id""")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                documents
                    .forEach {
                        (it as Document)
                        val changed = migrateReferences(it)
                        if (changed) {
                            log.info("Migrated doc with dbID ${it.id}")
                            docRepo.save(it)
                        }
                    }
                page++
            } while (documents.size == pageSize)
        }
    }

    private fun migrateReferences(doc: Document?): Boolean {
        val references = doc?.data?.get("references")
        if (references == null || references.isNull) return false
        var changed = false

        references.forEach {
            if (it.getString("referenceType").isNullOrEmpty()) {
                val isUrl: Boolean = it.getString("url")?.isNotEmpty() ?: false
                val isUuidRef: Boolean = it.getString("uuidRef")?.isNotEmpty() ?: false

                if (isUrl && isUuidRef) {
                    log.info("Reference with title '${it.getString("title")}' defined both 'url' and 'uuidRef'. Setting 'referenceType' to 'url' and delete field 'uuidRef'.")
                }

                val newReferenceType: String? = if (isUrl) {
                    "url"
                } else if (isUuidRef) {
                    "uuidRef"
                } else {
                    null
                }

                log.info("Before: $it")
                if (!newReferenceType.isNullOrEmpty()) {
                    (it as ObjectNode).apply {
                        put("referenceType", newReferenceType)
                    }
                    changed = true
                }
                log.info("After: $it")
            }
        }

        return changed
    }
}
