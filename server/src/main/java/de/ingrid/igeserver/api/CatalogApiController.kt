package de.ingrid.igeserver.api

import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class CatalogApiController : CatalogApi {

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var documentService: DocumentService

    override fun catalogs(): ResponseEntity<List<Catalog>> {
        val catalogs = catalogService.getCatalogs()
        // FIXME: function takes too long when there is a lot of documents (e.g. 10000)
//            .map { catalog -> addStatisticData(catalog) }

        return ResponseEntity.ok().body(catalogs)
    }

    private fun addStatisticData(catalog: Catalog): Catalog {
        val lastModifiedDoc = documentService.find(
            catalog.identifier,
            query = listOf(
                QueryField("type", "FOLDER", true)
            ),
            pageRequest = PageRequest.of(
                0,
                1
            )
        )
        if (!lastModifiedDoc.isEmpty) {
            catalog.lastDocModification = documentService.getLatestDocument(lastModifiedDoc.content[0], catalogId = catalog.identifier).modified
            catalog.countDocuments = lastModifiedDoc.totalElements.toInt()
        }
        return catalog
    }

    @AuditLog(action = "create_catalog")
    override fun createCatalog(settings: Catalog): ResponseEntity<Catalog> {
        if (catalogService.catalogWithNameExists(settings.name)) throw ConflictException.withReason("Catalog '${settings.name}' already exists")
        val catalog = catalogService.createCatalog(settings)

        catalogService.initializeCatalog(catalog.identifier, settings.type)

        return ResponseEntity.ok().body(catalog)
    }

    @AuditLog(action = "update_catalog")
    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {
        catalogService.updateCatalog(settings)
        return ResponseEntity.ok().build()
    }

    @AuditLog(action = "delete_catalog")
    override fun deleteCatalog(name: String): ResponseEntity<Void> {
        catalogService.removeCatalog(name)
        return ResponseEntity.ok().build()
    }
}