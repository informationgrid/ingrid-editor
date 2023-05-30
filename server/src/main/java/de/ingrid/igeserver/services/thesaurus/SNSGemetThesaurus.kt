package de.ingrid.igeserver.services.thesaurus

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.stereotype.Service
import java.net.URLEncoder

@Service
class SNSGemetThesaurus : ThesaurusService() {

    override val id = "gemet"
    
    private val searchUrlTemplate = "https://www.eionet.europa.eu/gemet"

    override fun search(term: String, options: ThesaurusSearchOptions): List<Keyword> {
        if (term.isEmpty()) return emptyList()

        val encodedTerm = URLEncoder.encode(term, "utf-8")

        val searchMode = convertSearchMode(options.searchType)
        val language = "de"

        val response = sendRequest(
            "GET",
            "$searchUrlTemplate/getConceptsMatchingKeyword?keyword=${encodedTerm}&search_mode=${searchMode}&thesaurus_uri=${ConceptType.CONCEPT}&language=${language}"
        )
        val json = jacksonObjectMapper().readValue<ArrayNode>(response)
        return mapToKeywordList(json)
    }

    private fun mapToKeywordList(json: ArrayNode): List<Keyword> {
        return json.map { Keyword(it.get("uri").asText(), it.get("preferredLabel").get("string").asText()) }
    }

    private fun convertSearchMode(searchType: ThesaurusSearchType): Int {
        return when (searchType) {
            ThesaurusSearchType.EXACT -> 0
            ThesaurusSearchType.BEGINS_WITH -> 1
            ThesaurusSearchType.ENDS_WITH -> 2
            ThesaurusSearchType.CONTAINS -> 3
        }
    }
}

enum class ConceptType(private val value: String) {
    CONCEPT("http://www.eionet.europa.eu/gemet/concept/"),
    GROUP("http://www.eionet.europa.eu/gemet/group/"),
    SOUPERGROUP("http://www.eionet.europa.eu/gemet/supergroup/");

    override fun toString(): String {
        return value
    }
}
