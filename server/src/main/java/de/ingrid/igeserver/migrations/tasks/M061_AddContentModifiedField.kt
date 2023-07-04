package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M061_AddContentModifiedField : MigrationBase("0.61") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val addColumnsSQL = """
        ALTER TABLE document
        ADD COLUMN contentmodified timestamptz NOT NULL DEFAULT NOW();
        ALTER TABLE document
        ADD COLUMN contentmodifiedby character varying(255) default null;
    """.trimIndent()

    private val migrateColumnSQL = """
        UPDATE document SET contentmodified = modified;
        UPDATE document SET contentmodifiedby = modifiedby;
        """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(addColumnsSQL).executeUpdate()
            entityManager.createNativeQuery(migrateColumnSQL).executeUpdate()
        }
    }

}
