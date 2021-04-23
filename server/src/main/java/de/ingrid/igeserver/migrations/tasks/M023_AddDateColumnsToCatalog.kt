package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.DBApi
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class M023_AddDateColumnsToCatalog : MigrationBase("0.23") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var dbService: DBApi

    private val sql = """
        ALTER TABLE catalog
        ADD COLUMN created timestamptz NOT NULL DEFAULT NOW();
        ALTER TABLE catalog
        ADD COLUMN modified timestamptz NOT NULL DEFAULT NOW();
    """.trimIndent()

    override fun exec() {
        dbService.acquireDatabase().use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }

    }

}