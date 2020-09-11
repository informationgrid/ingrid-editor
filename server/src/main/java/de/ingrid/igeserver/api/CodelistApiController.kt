package de.ingrid.igeserver.api

import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/codelist")
class CodelistApiController : CodelistApi {

    @Autowired
    private lateinit var handler: CodelistHandler

    override fun getCodelistsByIds(ids: List<String>): ResponseEntity<List<CodeList>> {
        val codelists = handler.getCodelists(ids)
        return ResponseEntity.ok(codelists)
    }

    override fun getAllCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.allCodelists
        return ResponseEntity.ok(codelists)
    }

    override fun updateCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.fetchCodelists() ?: throw ApiException("Codelists could not be synchronized")
        return ResponseEntity.ok(codelists)
    }
}
