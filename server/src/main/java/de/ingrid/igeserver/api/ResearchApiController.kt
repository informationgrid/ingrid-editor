package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
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
class ResearchApiController @Autowired constructor(
    val researchService: ResearchService,
    val queryService: QueryService,
    val catalogService: CatalogService,
    val authUtils: AuthUtils
) : ResearchApi {

    override fun load(principal: Principal): ResponseEntity<List<Query>> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val queries = queryService.getQueriesForUser(userId, catalogId)
        return ResponseEntity.ok(queries)
    }

    override fun save(principal: Principal, query: Query, forCatalog: Boolean): ResponseEntity<Query> {

        val userId = if (forCatalog) null else authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = queryService.saveQuery(userId, catalogId, query)
        return ResponseEntity.ok(result)

    }

    override fun delete(principal: Principal, id: Int): ResponseEntity<Void> {
        queryService.removeQueryForUser(id)
        return ResponseEntity.ok().build()
    }

    override fun search(principal: Principal, query: ResearchQuery): ResponseEntity<ResearchResponse> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val userName = authUtils.getUsernameFromPrincipal(principal)
        val userGroups = catalogService.getUser(userName)?.groups ?: emptySet()

        val result = researchService.query(principal, userGroups, catalogId, query)
        return ResponseEntity.ok(result)

    }

    override fun searchSql(principal: Principal, sqlQuery: String): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = researchService.querySql(principal, catalogId, sqlQuery)
        return ResponseEntity.ok(result)
    }

    override fun getQuickFilter(principal: Principal): ResponseEntity<Facets> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val dbType = catalogService.getCatalogById(catalogId).type

        val facets = researchService.createFacetDefinitions(dbType)
        return ResponseEntity.ok(facets)
    }

    override fun export(principal: Principal): ResponseEntity<Any> {
        TODO("Not yet implemented")
    }

}
