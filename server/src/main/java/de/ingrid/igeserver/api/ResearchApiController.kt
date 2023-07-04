package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.QueryService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusFactory
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusSearchOptions
import de.ingrid.igeserver.services.geothesaurus.SpatialResponse
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
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
    val authUtils: AuthUtils,
    val geoThesaurusFactory: GeoThesaurusFactory
) : ResearchApi {

    override fun load(principal: Principal): ResponseEntity<List<Query>> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val queries = queryService.getQueriesForUser(userId, catalogId)
        return ResponseEntity.ok(queries)
    }

    override fun save(principal: Principal, query: Query): ResponseEntity<Query> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
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

        val result = researchService.query(catalogId, query, principal)
        return ResponseEntity.ok(result)

    }

    override fun searchSql(principal: Principal, sqlQuery: String, page: Int?, pageSize: Int?): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val paging = if (page != null && pageSize != null) {
            ResearchPaging(page, pageSize)
        } else ResearchPaging()
        
        val result = researchService.querySql(principal, catalogId, sqlQuery, paging)
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

    override fun geoSearch(principal: Principal, query: String): ResponseEntity<List<SpatialResponse>> {
        val response = geoThesaurusFactory.get("wfsgnde").search(query, GeoThesaurusSearchOptions(ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(response)
        
    }

}
