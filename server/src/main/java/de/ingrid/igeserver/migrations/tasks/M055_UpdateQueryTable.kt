package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M055_UpdateQueryTable : MigrationBase("0.55") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sqlNewColumn = """
        alter table query add global boolean default false;
    """.trimIndent()
    
    private val sqlUpdate = """
        UPDATE query SET global=true WHERE user_id IS NULL;
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sqlNewColumn).executeUpdate()
            entityManager.createNativeQuery(sqlUpdate).executeUpdate()
        }
    }

}
