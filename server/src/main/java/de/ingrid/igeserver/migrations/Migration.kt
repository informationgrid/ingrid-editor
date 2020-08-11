package de.ingrid.igeserver.migrations

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.function.Consumer
import javax.annotation.PostConstruct

@Service
class Migration {

    private var log = logger()

    @Autowired
    private lateinit var dbService: DBApi

    @Autowired
    lateinit var migrationStrategies: List<MigrationStrategy>


    @PostConstruct
    fun init() {
        update()
    }

    private fun update() {
        val databases = dbService.databases
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
        setVersion(database, latestVersion.version);
    }

    private fun getStrategiesAfter(version: String): List<MigrationStrategy> {
        return migrationStrategies
                .filter { it.compareWithVersion(version) == VersionCompare.HIGHER }
                .sortedBy { it.version }
    }


    private fun getVersion(database: String): String {
        dbService.acquire(database).use {
            val info = dbService.findAll(CatalogInfoType::class)
            val infoDoc = info?.get(0)
            val version = infoDoc?.get("version")
            return if (version == null) "0" else version.asText()
        }
    }

    private fun setVersion(database: String, version: String) {
        dbService.acquire(database).use {
            val info = dbService.findAll(CatalogInfoType::class)
            val infoDoc = info?.get(0)
            if (infoDoc != null) {
                (infoDoc as ObjectNode).put("version", version)
                dbService.save(CatalogInfoType::class, dbService.getRecordId(infoDoc), infoDoc.toString())
            }
            // TODO should we throw an exception if version can not be set because of missing catalog info?
        }
    }

}