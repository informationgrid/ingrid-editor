package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Transform userIds of users to lowercase
 */
@Service
class M053_MigrateValidUntil : MigrationBase("0.53") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        // do everything in postExec
    }

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(
                """UPDATE document SET data = (replace(data\:\:text, 'expiryDate', 'validUntil')\:\:jsonb)"""
            ).executeUpdate()
        }
    }

}
