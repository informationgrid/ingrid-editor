package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.repository.CatalogRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M068_AddIngridQuery : MigrationBase("0.68") {

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

    @Autowired
    private lateinit var ingridProfile: InGridProfile

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            catalogRepo.findAllByType("ingrid").forEach { catalog ->
                ingridProfile.initCatalogQueries(catalog.identifier)
            }
        }
    }

}
