package de.ingrid.igeserver.api

import de.ingrid.igeserver.services.thesaurus.Keyword
import de.ingrid.igeserver.services.thesaurus.ThesaurusFactory
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchOptions
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import io.swagger.v3.oas.annotations.Parameter
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class KeywordsApiController(val thesaurusFactory: ThesaurusFactory) : KeywordsApi {
    override fun search(
        @Parameter(required = true) @PathVariable(value = "thesaurusId") thesaurusId: String,
        @RequestParam(required = true, value = "q") term: String,
        @RequestParam(value = "type") type: ThesaurusSearchType?
    ): ResponseEntity<List<Keyword>> {
        val result = thesaurusFactory.get(thesaurusId).search(term, ThesaurusSearchOptions(type ?: ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(result)
    }

}