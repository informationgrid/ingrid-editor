package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class `M019-1_AdaptUserInfoTable` : MigrationBase("0.19.1") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
            CREATE TABLE IF NOT EXISTS manager (
              user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
              manager_id   integer REFERENCES user_info(id) ON DELETE CASCADE,
              catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
              PRIMARY KEY (user_id, catalog_id)
            );
            
            CREATE TABLE IF NOT EXISTS stand_in (
              user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
              stand_in_id  integer REFERENCES user_info(id) ON DELETE CASCADE,
              catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
              PRIMARY KEY (user_id, stand_in_id, catalog_id)
            );
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
