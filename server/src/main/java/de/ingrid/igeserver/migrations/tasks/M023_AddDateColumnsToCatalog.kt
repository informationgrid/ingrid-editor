package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M023_AddDateColumnsToCatalog : MigrationBase("0.23") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        ALTER TABLE catalog
        ADD COLUMN created timestamptz NOT NULL DEFAULT NOW();
        ALTER TABLE catalog
        ADD COLUMN modified timestamptz NOT NULL DEFAULT NOW();
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }

    }

}