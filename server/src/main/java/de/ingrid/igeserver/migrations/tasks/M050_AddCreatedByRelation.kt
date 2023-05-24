package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M050_AddCreatedByRelation : MigrationBase("0.50") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        alter table document add createdbyuser integer default null;
        alter table document add modifiedbyuser integer default null;
        alter table document ADD CONSTRAINT document_created_id_fkey
            FOREIGN KEY (createdbyuser) REFERENCES public.user_info(id) ON DELETE SET NULL;
        alter table document ADD CONSTRAINT document_modified_id_fkey
            FOREIGN KEY (modifiedbyuser) REFERENCES public.user_info(id) ON DELETE SET NULL;
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
