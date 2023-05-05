package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M036_MigrateToMcloudAddresses : MigrationBase("0.36") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        DELETE FROM document_wrapper WHERE type = 'TestDoc';
        DELETE FROM document WHERE type = 'TestDoc';
        UPDATE document_wrapper
        SET type = 'McloudAddressDoc'
        WHERE type = 'AddressDoc';
        UPDATE document
        SET type = 'McloudAddressDoc'
        WHERE type = 'AddressDoc';
    """.trimIndent()

    override fun exec() {
        // delete all test documents and change address document type to mcloud address document type
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
