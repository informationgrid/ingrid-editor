package de.ingrid.igeserver.services.thesaurus

import com.fasterxml.jackson.databind.JsonNode
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
            .mapNotNull { mapToKeyword(it) }
            .toSet().toList().sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.preparedLabel })
    }

    private fun mapToKeyword(it: JsonNode): Keyword? {
        val labelElement = it.get("prefLabel") ?: it.get("officialName") ?: it.get("altLabel") ?: return null
        val alternativeLabel = it.get("altLabel")?.get(1)?.get("")?.asText()
        val label = labelElement.get(1).get("").asText()
        val preparedLabel = if (alternativeLabel != null)
            "$label (${alternativeLabel})"
        else label

        return Keyword(
            labelElement.get(0).get("resource").asText(),
            label,
            preparedLabel,
            if (alternativeLabel == label) null else alternativeLabel,
        )
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
