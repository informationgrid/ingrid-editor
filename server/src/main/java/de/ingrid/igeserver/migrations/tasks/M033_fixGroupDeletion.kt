package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M033_fixGroupDeletion : MigrationBase("0.33") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val modifyUserGroupTable = """
        alter table user_group drop constraint user_group_permission_group_id_fk;

        alter table user_group
        	add constraint user_group_permission_group_id_fk
        		foreign key (group_id) references permission_group
        			on delete cascade;
    """.trimIndent()


    override fun exec() {
        ClosableTransaction(transactionManager).use {

            entityManager.createNativeQuery(modifyUserGroupTable).executeUpdate()
            
        }
    }

}