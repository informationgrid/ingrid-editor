package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M026_AddUserGroupTable : MigrationBase("0.26") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        create table user_group (
            user_info_id int not null
                constraint user_group_user_info_id_fk
                    references user_info,
            group_id int not null
                constraint user_group_permission_group_id_fk
                    references permission_group,
            constraint user_group_pk
                primary key (user_info_id, group_id)
        );

        alter table permission_group drop column type;
        alter table permission_group drop column identifier;
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
