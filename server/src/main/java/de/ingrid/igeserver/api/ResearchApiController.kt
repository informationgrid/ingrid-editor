package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ResearchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/search"])
class ResearchApiController : ResearchApi {
    
    @Autowired
    lateinit var researchService: ResearchService
    
    @Autowired
    lateinit var catalogService: CatalogService
    
    override fun load(principal: Principal?): ResponseEntity<Array<ResearchQuery>> {
        TODO("Not yet implemented")
    }

    override fun save(principal: Principal?): ResponseEntity<Void> {
        TODO("Not yet implemented")
    }

    override fun delete(principal: Principal?): ResponseEntity<Void> {
        TODO("Not yet implemented")
    }

    override fun search(principal: Principal?, query: ResearchQuery): ResponseEntity<ResearchResponse> {
        
        val result = researchService.query(query)
        return ResponseEntity.ok(result)
        
    }

    override fun searchSql(principal: Principal?, sqlQuery: String): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val result = researchService.querySql(sqlQuery)
        return ResponseEntity.ok(result)
    }

    override fun getQuickFilter(principal: Principal?): ResponseEntity<Array<FacetGroup>> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val dbType = catalogService.getCatalogById(dbId).type
        
        val facets = researchService.createFacetDefinitions(dbType)
        return ResponseEntity.ok(facets)
    }

    override fun export(principal: Principal?): ResponseEntity<Any> {
        TODO("Not yet implemented")
    }

}