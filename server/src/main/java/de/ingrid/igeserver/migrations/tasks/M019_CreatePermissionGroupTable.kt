package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M019_CreatePermissionGroupTable : MigrationBase("0.19") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        CREATE SEQUENCE permission_group_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
        CREATE TABLE permission_group (
          id              integer DEFAULT nextval('permission_group_id_seq') NOT NULL,
          catalog_id      integer NOT NULL,
          identifier      varchar(255) NOT NULL, -- derived from name, used in API
          name            varchar(255) NOT NULL,
          type            varchar(255) NOT NULL, -- needs refactoring since info is not really needed here
          description     text,
          permissions     jsonb,
          CONSTRAINT "permission_group_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "permission_group_catalog_id_fkey" FOREIGN KEY (catalog_id) REFERENCES catalog (id) ON DELETE CASCADE NOT DEFERRABLE
        ) WITH (oids = false);
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}
