package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.DependsOn
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class M023_ModifyCatalogTable : MigrationBase("0.23") {

    private var log = logger()

    @Autowired
    lateinit var docService: DocumentService

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var dbService: DBApi

    private val sql = """
        alter table catalog add settings jsonb;
        alter table catalog drop column version;
    """.trimIndent()

    override fun exec() {
        dbService.acquireDatabase().use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }

    }

}