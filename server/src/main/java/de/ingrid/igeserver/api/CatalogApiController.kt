package de.ingrid.igeserver.api

import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.services.CatalogService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class CatalogApiController : CatalogApi {

    @Autowired
    private lateinit var dbService: DBApi
    
    @Autowired
    private lateinit var catalogService: CatalogService

    override fun catalogs(): ResponseEntity<List<Catalog>> {
        val catalogs = dbService.catalogs
                .map { catalogService.getCatalogById(it) }

        return ResponseEntity.ok().body(catalogs)
    }

    @AuditLog(action="create_catalog")
    override fun createCatalog(settings: Catalog): ResponseEntity<String> {
        val catalogId = dbService.createCatalog(settings)

        catalogService.initializeCodelists(catalogId!!, settings.type)
        return ResponseEntity.ok().body("{ \"catalogId\": \"$catalogId\"}")
    }

    @AuditLog(action="update_catalog")
    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {
        dbService.updateCatalog(settings)
        return ResponseEntity.ok().build()
    }

    @AuditLog(action="delete_catalog")
    override fun deleteCatalog(name: String): ResponseEntity<Void> {
        dbService.removeCatalog(name)
        return ResponseEntity.ok().build()
    }
}