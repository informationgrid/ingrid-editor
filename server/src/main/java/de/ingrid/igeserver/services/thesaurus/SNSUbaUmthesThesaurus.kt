package de.ingrid.igeserver.services.thesaurus

import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import org.springframework.stereotype.Service

@Service
class SNSUbaUmthesThesaurus : ThesaurusService() {

    val searchUrlTemplate = "https://sns.uba.de/umthes/de/search.rdf?q="

    override fun search(term: String, options: ThesaurusSearchOptions): List<Keyword> {
        if (term.isEmpty()) return emptyList()
        
        val response = sendRequest("GET", "$searchUrlTemplate$term&qt=contains")
        val mapper = XmlMapper(JacksonXmlModule())
        return mapper.readTree(response).get("Description")
            .mapNotNull { it.get("prefLabel") }
            .map { Keyword(it.get(0).get("resource").asText(), it.get(1).get("").asText()) }
    }
}
