package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class M022_UpdateQueryTableModifiedColumn : MigrationBase("0.22") {

    private var log = logger()

    @Autowired
    lateinit var docService: DocumentService

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var dbService: DBApi

    private val sql = """
        ALTER TABLE query
        ADD COLUMN modified timestamptz NOT NULL DEFAULT NOW();
    """.trimIndent()

    override fun exec() {
        dbService.acquireDatabase().use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }

    }

}