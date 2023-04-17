package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M027_AddRoleTable : MigrationBase("0.27") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        create sequence role_id_seq
            as integer;

        create table role
        (
            id          integer default nextval('role_id_seq') not null constraint role_pk primary key,
            name        varchar not null,
            permissions jsonb
        );
        
        insert into role (id, name, permissions) values (1, 'ige-super-admin', null);
        insert into role (id, name, permissions) values (2, 'cat-admin', null);
        insert into role (id, name, permissions) values (3, 'md-admin', null);
        insert into role (id, name, permissions) values (4, 'author', null);


        alter table user_info
            add role_id int;
        
        alter table user_info
            add constraint user_info_role_id_fk
                foreign key (role_id) references role;




    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
