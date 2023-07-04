package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M060_RemoveUnusedColumns : MigrationBase("0.60") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sqlUpdate = """
        alter table document_wrapper drop column draft;
        alter table document_wrapper drop column published;
        alter table document_wrapper drop column pending;
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sqlUpdate).executeUpdate()
        }
    }

}
