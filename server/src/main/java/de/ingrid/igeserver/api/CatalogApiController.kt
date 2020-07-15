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

            val catalogs = dbService.databases
                    .map { catalogService.getCatalogById(it) }
                    .filterNotNull()

            return ResponseEntity.ok().body(catalogs)

        }

    @Throws(ApiException::class)
    override fun createCatalog(settings: Catalog): ResponseEntity<String> {

        val catalogId = dbService.createDatabase(settings)
        return ResponseEntity.ok().body("{ \"catalogId\": \"$catalogId\"}")

    }

    @Throws(ApiException::class)
    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {

        dbService.updateDatabase(settings)
        return ResponseEntity.ok().build()

    }

    override fun deleteCatalog(name: String): ResponseEntity<Void> {

        dbService.removeDatabase(name)
        return ResponseEntity.ok().build()

    }
}