package de.ingrid.igeserver.api

import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class CatalogApiController : CatalogApi {

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun catalogs(): ResponseEntity<List<Catalog>> {
        val catalogs = catalogService.getCatalogs()

        return ResponseEntity.ok().body(catalogs)
    }

    @AuditLog(action="create_catalog")
    override fun createCatalog(settings: Catalog): ResponseEntity<Catalog> {
        val catalog = catalogService.createCatalog(settings)

        catalogService.initializeCodelists(catalog.identifier, settings.type)
        return ResponseEntity.ok().body(catalog)
    }

    @AuditLog(action="update_catalog")
    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {
        catalogService.updateCatalog(settings)
        return ResponseEntity.ok().build()
    }

    @AuditLog(action="delete_catalog")
    override fun deleteCatalog(name: String): ResponseEntity<Void> {
        catalogService.removeCatalog(name)
        return ResponseEntity.ok().build()
    }
}