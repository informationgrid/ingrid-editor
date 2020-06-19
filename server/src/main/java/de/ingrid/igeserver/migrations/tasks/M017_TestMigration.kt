package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import org.springframework.stereotype.Service

@Service
class M017_TestMigration : MigrationBase("0.17") {

    override fun exec(databaseName: String) {
        println("Executing migration 0.17")
    }

}