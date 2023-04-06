package de.ingrid.igeserver.services.thesaurus

import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import org.springframework.stereotype.Service
import java.net.URLEncoder

@Service
class SNSUbaUmthesThesaurus : ThesaurusService() {

    val searchUrlTemplate = "https://sns.uba.de/umthes/de/search.rdf?q="

    override fun search(term: String, options: ThesaurusSearchOptions): List<Keyword> {
        if (term.isEmpty()) return emptyList()
        
        val encodedTerm = URLEncoder.encode(term, "utf-8");

        val type = convertType(options.searchType)
        val response = sendRequest("GET", "$searchUrlTemplate$encodedTerm&qt=$type")
        val mapper = XmlMapper(JacksonXmlModule())
        return mapper.readTree(response).get("Description")
            .mapNotNull { it.get("prefLabel") ?: it.get("officialName") ?: it.get("altLabel") }
            .map { Keyword(it.get(0).get("resource").asText(), it.get(1).get("").asText()) }
            .toSet().toList()
    }

    private fun convertType(searchType: ThesaurusSearchType): String {
        return when (searchType) {
            ThesaurusSearchType.EXACT -> "exact"
            ThesaurusSearchType.BEGINS_WITH -> "begins_with"
            ThesaurusSearchType.ENDS_WITH -> "ends_with"
            ThesaurusSearchType.CONTAINS -> "contains"
        }
    }
}
