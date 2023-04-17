package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.DocumentService
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M021_AddQueryTable : MigrationBase("0.21") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var docService: DocumentService

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        CREATE SEQUENCE query_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
        CREATE TABLE query (
          id              integer DEFAULT nextval('query_id_seq') NOT NULL,
          catalog_id      integer NOT NULL,
          user_id         integer, -- if NULL then this query is shown to all users of this catalog
          category        varchar(255) NOT NULL,
          name            varchar(255) NOT NULL,
          description     text,
          data            jsonb,
          CONSTRAINT "query_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "query_catalog_id_fkey" FOREIGN KEY (catalog_id) REFERENCES catalog (id) ON DELETE CASCADE NOT DEFERRABLE,
          CONSTRAINT "query_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_info (id) ON DELETE CASCADE NOT DEFERRABLE
        ) WITH (oids = false);
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }

}