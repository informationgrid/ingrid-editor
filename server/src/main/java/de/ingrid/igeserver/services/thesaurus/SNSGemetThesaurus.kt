/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.services.thesaurus

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import java.net.URLEncoder
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors

@Service
class SNSGemetThesaurus : ThesaurusService() {

    private val log = logger()
    override val id = "gemet"

    private val searchUrlTemplate = "https://www.eionet.europa.eu/gemet"

    // Thread pool for parallel execution of HTTP requests, lazy initialized
    private val executor by lazy { Executors.newFixedThreadPool(10) }

    override fun search(term: String, options: ThesaurusSearchOptions): List<Keyword> {
        if (term.isEmpty()) return emptyList()

        val encodedTerm = URLEncoder.encode(term, "utf-8")

        val searchMode = convertSearchMode(options.searchType)
        val language = "de"

        val response = sendRequest(
            "GET",
            "$searchUrlTemplate/getConceptsMatchingKeyword?keyword=$encodedTerm&search_mode=$searchMode&thesaurus_uri=${ConceptType.CONCEPT}&language=$language",
        )
        val json = jacksonObjectMapper().readValue<ArrayNode>(response)
        return mapToKeywordList(json)
    }

    private fun mapToKeywordList(json: ArrayNode): List<Keyword> {
        log.debug("Processing ${json.size()} keywords in parallel")

        // Create a list of CompletableFuture for each request using our thread pool
        val futures = json.map { item ->
            CompletableFuture.supplyAsync({
                val uri = item.getStringOrEmpty("uri")
                log.debug("Fetching English label for concept: $uri")

                // get alternate English name
                val englishResponse = sendRequest(
                    "GET",
                    "$searchUrlTemplate/getConcept?concept_uri=$uri&language=en",
                )
                val englishNode = jacksonObjectMapper().readValue<ObjectNode>(englishResponse)
                Keyword(
                    uri,
                    item.getStringOrEmpty("preferredLabel.string"),
                    englishNode.getString("preferredLabel.string"),
                )
            }, executor)
        }

        // Wait for all futures to complete and collect results
        return futures
            .map { it.join() }
            .also { log.debug("Completed processing ${it.size} keywords") }
    }

    private fun convertSearchMode(searchType: ThesaurusSearchType): Int = when (searchType) {
        ThesaurusSearchType.EXACT -> 0
        ThesaurusSearchType.BEGINS_WITH -> 1
        ThesaurusSearchType.ENDS_WITH -> 2
        ThesaurusSearchType.CONTAINS -> 3
    }
}

enum class ConceptType(private val value: String) {
    CONCEPT("http://www.eionet.europa.eu/gemet/concept/"),
    GROUP("http://www.eionet.europa.eu/gemet/group/"),
    SOUPERGROUP("http://www.eionet.europa.eu/gemet/supergroup/"),
    ;

    override fun toString(): String = value
}
