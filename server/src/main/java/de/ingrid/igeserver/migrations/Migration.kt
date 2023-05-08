package de.ingrid.igeserver.migrations

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.repository.VersionInfoRepository
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class Migration : ApplicationRunner {

    private var log = logger()

    @Autowired
    lateinit var migrationStrategies: List<MigrationStrategy>

    @Autowired
    lateinit var versionRepo: VersionInfoRepository

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

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

        var lastSuccessfulMigration: Version? = null
        try {
            // first execute all migrations
            strategies.forEach { strategy ->
                log.info("Executing strategy: ${strategy.version}")
                strategy.exec()
                lastSuccessfulMigration = strategy.version
            }

            // second execute all post migrations which need the latest database model
            strategies.forEach { strategy ->
                log.info("Executing post strategy: ${strategy.version}")
                strategy.postExec()
            }
        } catch (e: Exception) {
            log.error("There was an error during migration")
            setVersionSafe(lastSuccessfulMigration)
            throw e
        }

        setVersionSafe(lastSuccessfulMigration)
    }

    private fun setVersionSafe(lastSuccessfulMigration: Version?) {
        if (lastSuccessfulMigration != null) {
            setVersion(lastSuccessfulMigration.version)
        }
    }

    private fun getStrategiesAfter(version: String): List<MigrationStrategy> {
        return migrationStrategies
            .filter { it.compareWithVersion(version) == VersionCompare.HIGHER }
            .sortedBy { it.version }
    }


    private fun getVersion(): String {
        val info = versionRepo.findById(1).get()
        return info.value ?: "0"
    }

    private fun setVersion(version: String) {
        val info = versionRepo.findById(1).get()
        info.value = version
        versionRepo.save(info)
    }

    private fun setupVersioning() {
        val createVersionTable = """
            CREATE TABLE IF NOT EXISTS version_info (
              id              serial PRIMARY KEY,
              key             varchar(255) NOT NULL,
              value           varchar(255)
            );
        """.trimIndent()
        val insertSchemaVersion =
            "INSERT INTO version_info (key, value) VALUES ('schema_version', '0') ON CONFLICT DO NOTHING"
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(createVersionTable).executeUpdate()
            val items = entityManager.createQuery("SELECT items FROM VersionInfo items")
            if (items.resultList.isEmpty()) {
                entityManager.createNativeQuery(insertSchemaVersion).executeUpdate()
            }
        }
    }
}
