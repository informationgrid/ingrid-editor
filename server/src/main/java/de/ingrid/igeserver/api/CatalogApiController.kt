package de.ingrid.igeserver.api

import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api")
class CatalogApiController @Autowired constructor(
    var catalogService: CatalogService,
    var documentService: DocumentService,
    var researchService: ResearchService
) : CatalogApi {

    override fun catalogs(): ResponseEntity<List<Catalog>> {
        val catalogs = catalogService.getCatalogs()

        return ResponseEntity.ok().body(catalogs)
    }

    override fun catalogStatistic(identifier: String): ResponseEntity<CatalogStatistic> {
        val statistic = getStatisticData(identifier)
        return ResponseEntity.ok().body(statistic)
    }

    private fun getStatisticData(catalogIdentifier: String): CatalogStatistic {

        val auth = SecurityContextHolder.getContext().authentication
        val filter = BoolFilter("AND", listOf("document_wrapper.type != 'FOLDER'", "deleted = 0"), null, null, false)
        val response = researchService.query(
            auth,
            emptySet(),
            catalogIdentifier,
            ResearchQuery(
                null,
                filter,
                orderByField = "modified",
                orderByDirection = "DESC",
                pagination = ResearchPaging(1, 1)
            )
        )

        return if (response.totalHits > 0) {
            val hit = response.hits[0]
            CatalogStatistic(
                hit._modified,
                response.totalHits
            )
        } else {
            CatalogStatistic()
        }
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


data class CatalogStatistic(
    val lastDocModification: Date? = null,
    val countDocuments: Int = 0
)