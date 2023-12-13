package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M076_AddCatalogIdentifierToAuditLog : MigrationBase("0.76") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
         UPDATE audit_log SET
    message = jsonb_set(message, '{catalogIdentifier}', to_jsonb(catalog.identifier))
    FROM document_wrapper, catalog
    WHERE message @> '{"cat": "data-history"}'
    AND NOT message ? 'catalogIdentifier'
    AND message->>'target' = document_wrapper.uuid
    AND document_wrapper.catalog_id = catalog.id;
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
