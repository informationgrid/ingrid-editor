package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M038_UpdateMcloudCodelists : MigrationBase("0.38") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var catalogRepo: CatalogRepository

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager


    override fun exec() {
        log.info("Update mCLOUD Codelists!")

        ClosableTransaction(transactionManager).use {
            try {
                val mCloudProfile = catalogService.getCatalogProfile("mcloud")
                catalogRepo.findAll()
                    .filter { catalog: Catalog -> catalog.type == mCloudProfile.identifier }
                    .forEach { catalog: Catalog ->
                        log.info("Update Catalog: " + catalog.name)
                        catalogService.initializeCodelists(catalog.identifier, catalog.type)
                    }
            } catch (e: NotFoundException) {
                log.debug("Cannot update mcloud codelists, since mcloud profile is not activated")
            }
        }
    }

}
