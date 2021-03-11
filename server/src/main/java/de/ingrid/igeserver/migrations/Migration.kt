package de.ingrid.igeserver.migrations

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Service
import java.util.function.Consumer

@Service
class Migration : ApplicationRunner {

    private var log = logger()

    @Autowired
    private lateinit var dbService: DBApi

    @Autowired
    lateinit var migrationStrategies: List<MigrationStrategy>

    /**
     * Install migrations after spring application context is initialized
     */
    override fun run(args: ApplicationArguments?) {
        update()
    }

    private fun update() {
        val databases = dbService.catalogs
        for (database in databases) {
            executeMigrationsForDatabase(database)
        }
    }

    private fun executeMigrationsForDatabase(database: String) {
        val version = getVersion(database)

        val strategies = getStrategiesAfter(version)

        if (strategies.isEmpty()) {
            return
        }

        strategies.forEach(Consumer { strategy: MigrationStrategy -> strategy.exec(database) })

        val latestVersion = strategies[strategies.size - 1].version
        setVersion(database, latestVersion.version)
    }

    private fun getStrategiesAfter(version: String): List<MigrationStrategy> {
        return migrationStrategies
                .filter { it.compareWithVersion(version) == VersionCompare.HIGHER }
                .sortedBy { it.version }
    }


    private fun getVersion(database: String): String {
        dbService.acquireCatalog(database).use {
            val info = dbService.findAll(CatalogInfoType::class)
            val infoDoc = info.get(0)
            val version = infoDoc.get("version")
            return if (version.isNull) "0" else version.asText()
        }
    }

    private fun setVersion(database: String, version: String) {
        dbService.acquireCatalog(database).use {
            val info = dbService.findAll(CatalogInfoType::class)
            val infoDoc = info.get(0)
            (infoDoc as ObjectNode).put("version", version)
            dbService.save(CatalogInfoType::class, dbService.getRecordId(infoDoc), infoDoc.toString())
            // TODO should we throw an exception if version can not be set because of missing catalog info?
        }
    }
}