package de.ingrid.igeserver.migrations

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.VersionInfoType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Service

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
        setupVersioning()
        update()
    }

    private fun update() {
        val version = getVersion()

        val strategies = getStrategiesAfter(version)

        if (strategies.isEmpty()) {
            return
        }

        strategies.forEach { strategy ->
            log.info("Executing strategy: ${strategy.version}")
            strategy.exec()
        }

        val latestVersion = strategies[strategies.size - 1].version
        setVersion(latestVersion.version)
    }

    private fun getStrategiesAfter(version: String): List<MigrationStrategy> {
        return migrationStrategies
            .filter { it.compareWithVersion(version) == VersionCompare.HIGHER }
            .sortedBy { it.version }
    }


    private fun getVersion(): String {
        dbService.acquireDatabase().use {
            val info = dbService.find(VersionInfoType::class, "1")
            return info?.get("value")?.asText() ?: "0"
        }
    }

    private fun setVersion(version: String) {
        dbService.acquireDatabase().use {
            val info = dbService.find(VersionInfoType::class, "1") as ObjectNode
            info.put("value", version)
            dbService.save(VersionInfoType::class, "1", info.toString())
        }
    }

    private fun setupVersioning() {
        val sql = """
            CREATE TABLE IF NOT EXISTS version_info (
              id              serial PRIMARY KEY,
              key             varchar(255) NOT NULL,
              value           varchar(255)
            );
            INSERT INTO version_info (id, key, value) VALUES (1, 'schema_version', '0') ON CONFLICT DO NOTHING; 
        """.trimIndent()
        dbService.acquireDatabase().use {
            dbService.execSQL(sql)
        }

    }
}