package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class M020_AddCodelistTable : MigrationBase("0.20") {

    private var log = logger()

    @Autowired
    lateinit var docService: DocumentService

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var dbService: PostgreSQLAccess

    @Autowired
    lateinit var catalogService: CatalogService

    private val sql = """
        CREATE SEQUENCE codelist_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
        CREATE TABLE codelist (
          id              integer DEFAULT nextval('codelist_id_seq') NOT NULL,
          identifier      varchar(255) NOT NULL,
          catalog_id      integer NOT NULL,
          name            varchar(255) NOT NULL,
          description     text,
          data            jsonb,
          UNIQUE (identifier, catalog_id),
          CONSTRAINT "codelist_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "codelist_catalog_id_fkey" FOREIGN KEY (catalog_id) REFERENCES catalog (id) ON DELETE CASCADE NOT DEFERRABLE
        ) WITH (oids = false);
    """.trimIndent()

    override fun exec() {
        dbService.getTransaction().use {
            log.info("Create table codelist")
            entityManager.createNativeQuery(sql).executeUpdate()
        }

        dbService.catalogs.forEach { catalog ->
            dbService.acquireCatalog(catalog.identifier!!).use {
                log.info("Migrate catalog codelists for catalog: ${catalog.name}")
                catalogService.initializeCodelists(catalog.type!!)
            }
        }

    }

}