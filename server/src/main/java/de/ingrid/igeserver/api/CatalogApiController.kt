package de.ingrid.igeserver.api

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

    override val catalogs: ResponseEntity<List<Catalog>>
        get() {
            val catalogs = dbService.catalogs
                    .map { catalogService.getCatalogById(it) }
                    .filterNotNull()

            return ResponseEntity.ok().body(catalogs)
        }

    override fun createCatalog(settings: Catalog): ResponseEntity<String> {
        val catalogId = dbService.createCatalog(settings)
        return ResponseEntity.ok().body("{ \"catalogId\": \"$catalogId\"}")
    }

    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {
        dbService.updateCatalog(settings)
        return ResponseEntity.ok().build()
    }

    override fun deleteCatalog(name: String): ResponseEntity<Void> {
        dbService.removeCatalog(name)
        return ResponseEntity.ok().build()
    }
}