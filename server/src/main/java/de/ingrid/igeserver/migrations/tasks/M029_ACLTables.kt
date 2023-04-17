package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M029_ACLTables : MigrationBase("0.29") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        create table acl_sid(
        	id bigserial not null primary key,
        	principal boolean not null,
        	sid varchar(100) not null,
        	constraint unique_uk_1 unique(sid,principal)
        );
        
        create table acl_class(
        	id bigserial not null primary key,
        	class varchar(100) not null,
            class_id_type varchar(255),
        	constraint unique_uk_2 unique(class)
        );

        create table acl_object_identity(
        	id bigserial primary key,
        	object_id_class bigint not null,
        	object_id_identity varchar(255) NOT NULL,
        	parent_object bigint,
        	owner_sid bigint,
        	entries_inheriting boolean not null,
        	constraint unique_uk_3 unique(object_id_class,object_id_identity),
        	constraint foreign_fk_1 foreign key(parent_object)references acl_object_identity(id),
        	constraint foreign_fk_2 foreign key(object_id_class)references acl_class(id),
        	constraint foreign_fk_3 foreign key(owner_sid)references acl_sid(id)
        );

        create table acl_entry(
        	id bigserial primary key,
        	acl_object_identity bigint not null,
        	ace_order int not null,
        	sid bigint not null,
        	mask integer not null,
        	granting boolean not null,
        	audit_success boolean not null,
        	audit_failure boolean not null,
        	constraint unique_uk_4 unique(acl_object_identity,ace_order),
        	constraint foreign_fk_4 foreign key(acl_object_identity) references acl_object_identity(id),
        	constraint foreign_fk_5 foreign key(sid) references acl_sid(id)
        );
        
        alter table document_wrapper add path text[];
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}