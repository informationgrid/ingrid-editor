package de.ingrid.igeserver.api

import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api/codelist")
class CodelistApiController : CodelistApi {

    @Autowired
    private lateinit var handler: CodelistHandler

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var db: PostgreSQLAccess

    override fun getCodelistsByIds(principal: Principal?, ids: List<String>): ResponseEntity<List<CodeList>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val codelists = handler.getCodelists(ids)

        val catalogCodelists = handler.getCatalogCodelists(catalogId)
            .filter { ids.contains(it.id) }

        return ResponseEntity.ok(codelists + catalogCodelists)
    }

    override fun getCatalogCodelists(principal: Principal?): ResponseEntity<List<CodeList>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val findAll = handler.getCatalogCodelists(catalogId)

        return ResponseEntity.ok(findAll)
    }

    override fun updateCatalogCodelist(
        principal: Principal?,
        id: String,
        codelist: Codelist
    ): ResponseEntity<Codelist> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        db.acquireCatalog(catalogId).use {
            val response = db.save(codelist, id)
            return ResponseEntity.ok(response)
        }
    }

    /*override fun addCatalogCodelist(principal: Principal?): ResponseEntity<Codelist> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
//        db.getByIdentifier(Catalog::class,"test")
        // coming from the frontend
        val newCodelist = Codelist().apply {
            identifier = "internalMade"
            name = "xxx"
            description = "yyy"
        }

        // add catalog info
        // newCodelist.catalog = Catalog.getByIdentifier(db.getEntityManager(), catalogId)!!

        db.acquireCatalog(catalogId).use {
            val saved = db.save(newCodelist)
            return ResponseEntity.ok(saved)
        }

    }

    override fun updateCatalogCodelist(principal: Principal?): ResponseEntity<Codelist> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        *//*db.find()
        
        db.getTransaction().use { 
            val saved = db.save(newCodelist)
            return ResponseEntity.ok(saved)
        }*//*
        return ResponseEntity.badRequest().build()
    }*/

    override fun getAllCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.allCodelists
        return ResponseEntity.ok(codelists)
    }

    override fun updateCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.fetchCodelists() ?: throw ServerException.withReason("Failed to synchronize code lists")
        return ResponseEntity.ok(codelists)
    }
}
