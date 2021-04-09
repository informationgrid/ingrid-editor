package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.QueryService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/search"])
class ResearchApiController : ResearchApi {

    @Autowired
    lateinit var dbService: PostgreSQLAccess

    @Autowired
    lateinit var researchService: ResearchService

    @Autowired
    lateinit var queryService: QueryService

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    lateinit var authUtils: AuthUtils

    override fun load(principal: Principal?): ResponseEntity<List<Query>> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(catalogId).use {
            val queries = queryService.getQueriesForUser(userId, catalogId)
            return ResponseEntity.ok(queries)
        }
    }

    override fun save(principal: Principal?, query: Query): ResponseEntity<Query> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(catalogId).use {
            val result = queryService.saveQueryForUser(userId, query)
            return ResponseEntity.ok(result)
        }

    }

    override fun delete(principal: Principal?, id: Int): ResponseEntity<Void> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(catalogId).use {
            queryService.removeQueryForUser(userId, id)
            return ResponseEntity.ok().build()
        }
    }

    override fun search(principal: Principal?, query: ResearchQuery): ResponseEntity<ResearchResponse> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = researchService.query(dbId, query)
        return ResponseEntity.ok(result)

    }

    override fun searchSql(principal: Principal?, sqlQuery: String): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = researchService.querySql(dbId, sqlQuery)
        return ResponseEntity.ok(result)
    }

    override fun getQuickFilter(principal: Principal?): ResponseEntity<Facets> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val dbType = catalogService.getCatalogById(dbId).type

        val facets = researchService.createFacetDefinitions(dbType)
        return ResponseEntity.ok(facets)
    }

    override fun export(principal: Principal?): ResponseEntity<Any> {
        TODO("Not yet implemented")
    }

}