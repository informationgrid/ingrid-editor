package de.ingrid.igeserver.migrations.tasks

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
 * Remove property geometryContext from geo-datasets except in catalog "ingrid-up-sh"
 */
@Service
class M093HmdkRemovePropertyGeometryContext: MigrationBase("0.93")  {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {
        log.info("Executing migration 0.93")
    }

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            do {
                // in every catalog except "ingrid-up-sh" -> remove "geometryContext"
                val documents = entityManager.createQuery("""SELECT doc FROM Document doc WHERE doc.catalog.type!="ingrid-up-sh" ORDER BY id""")
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
        val geometryContext = doc?.data?.get("geometryContext")
        if (geometryContext == null || geometryContext.isNull) {
            return false
        } else {
            log.info("Remove 'geometryContext': $geometryContext")
            doc.data.remove("geometryContext")
            return true
        }
    }
}