package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager

@Service
class M027_AddRoleTable : MigrationBase("0.27") {

    private var log = logger()

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
        
        insert into role (id, name, permissions) values (1, 'cat-admin', null);
        insert into role (id, name, permissions) values (2, 'md-admin', null);
        insert into role (id, name, permissions) values (3, 'author', null);


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