package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class M017_TestMigration : MigrationBase("0.17") {

    private var log = logger()

    override fun exec(databaseName: String) {
        log.info("Executing migration 0.17")
    }

}