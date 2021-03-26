package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.DBApi
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class M020_AdaptUserInfoTable : MigrationBase("0.20") {

    private var log = logger()

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

    @Autowired
    lateinit var dbService: DBApi

    override fun exec() {
        dbService.acquireDatabase().use {
            dbService.execSQL(sql)
        }
    }

}
