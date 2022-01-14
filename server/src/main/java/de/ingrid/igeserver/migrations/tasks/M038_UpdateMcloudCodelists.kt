import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class M038_UpdateMcloudCodelists : MigrationBase("0.38") {

    private var log = logger()

    @Autowired
    @JsonIgnore
    lateinit var catalogRepo: CatalogRepository

    @Autowired
    @JsonIgnore
    lateinit var catalogService: CatalogService


    override fun exec() {
        log.info("Update mCLOUD Codelists!")
        var mCloudProfile = catalogService.getCatalogProfile("mcloud")
        catalogRepo.findAll()
            .filter { catalog: Catalog -> catalog.type.equals(mCloudProfile.identifier) }
            .forEach { catalog: Catalog ->
                log.info("Update Catalog: "+catalog.name)
                catalogService.initializeCodelists(catalog.identifier, catalog.type)
            }
    }

}
