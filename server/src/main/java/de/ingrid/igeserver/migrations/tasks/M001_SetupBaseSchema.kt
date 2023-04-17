package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M001_SetupBaseSchema : MigrationBase("0.01") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """

CREATE TABLE catalog (
  id              serial PRIMARY KEY,
  identifier      varchar(255) NOT NULL, -- derived from name, used in API
  type            varchar(255) NOT NULL,
  name            varchar(255) NOT NULL,
  description     text,
  version         varchar(255) -- version for migrations, could be different for different catalogs
);

CREATE TABLE user_info (
  id              serial PRIMARY KEY,
  user_id         varchar(255) NOT NULL,
  cur_catalog_id  integer REFERENCES catalog(id) ON DELETE SET NULL, -- can be null !!!
  data            jsonb
);

CREATE TABLE manager (
  user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
  manager_id   integer REFERENCES user_info(id) ON DELETE CASCADE,
  catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, catalog_id)
);

CREATE TABLE stand_in (
  user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
  stand_in_id  integer REFERENCES user_info(id) ON DELETE CASCADE,
  catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, stand_in_id, catalog_id)
);

CREATE TABLE catalog_user_info (
  catalog_id      integer REFERENCES catalog(id) ON DELETE CASCADE,
  user_info_id    integer REFERENCES user_info(id) ON DELETE CASCADE,
  PRIMARY KEY (catalog_id, user_info_id)
);

CREATE TABLE behaviour (
  id              serial PRIMARY KEY,
  catalog_id      integer NOT NULL REFERENCES catalog(id) ON DELETE CASCADE,
  name            varchar(255) NOT NULL,
  active          boolean NOT NULL,
  data            jsonb
);
CREATE INDEX idx_behaviour_data ON behaviour USING gin (data);

CREATE TABLE document (
  id              serial PRIMARY KEY,
  catalog_id      integer NOT NULL REFERENCES catalog(id) ON DELETE CASCADE,
  uuid            varchar(255) NOT NULL,
  type            varchar(255) NOT NULL,
  title           varchar(255) NOT NULL,
  data            jsonb,
  version         integer, -- record version for mvcc
  created         timestamptz NOT NULL DEFAULT NOW(),
  modified        timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_document_data ON document USING gin (data);

CREATE TABLE document_wrapper (
  id              serial PRIMARY KEY,
  catalog_id      integer NOT NULL REFERENCES catalog(id) ON DELETE CASCADE,
  parent_id       integer REFERENCES document_wrapper(id) ON DELETE CASCADE,
  uuid            varchar(255) NOT NULL,
  type            varchar(255) NOT NULL,
  category        varchar(255) NOT NULL,
  draft           integer REFERENCES document(id) ON DELETE SET NULL, -- how to ensure that document is referenced only once in wrapper ?
  published       integer REFERENCES document(id) ON DELETE SET NULL,
  version         integer -- record version for mvcc
);

CREATE TABLE document_archive (
  wrapper_id      integer REFERENCES document_wrapper(id) ON DELETE CASCADE,
  document_id     integer REFERENCES document(id) ON DELETE CASCADE,
  PRIMARY KEY (wrapper_id, document_id)
);
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            // only setup schema if any/catalog table exists 
            val found = entityManager.createNativeQuery("SELECT cast(to_regclass('catalog') as varchar)").resultList.first()
            if (found == null) {
                entityManager.createNativeQuery(sql).executeUpdate()
            }
        }
    }

}
