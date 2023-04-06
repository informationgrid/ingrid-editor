package de.ingrid.igeserver.api

import de.ingrid.igeserver.services.thesaurus.Keyword
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchOptions
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import de.ingrid.igeserver.services.thesaurus.ThesaurusService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class KeywordsApiController(val thesaurusService: ThesaurusService) : KeywordsApi {
    override fun search(thesaurusId: String, term: String): ResponseEntity<List<Keyword>> {
        val result = thesaurusService.search(term, ThesaurusSearchOptions(ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(result)
    }

}