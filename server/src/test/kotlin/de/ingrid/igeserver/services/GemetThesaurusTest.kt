package de.ingrid.igeserver.services

import de.ingrid.igeserver.services.thesaurus.Keyword
import de.ingrid.igeserver.services.thesaurus.SNSGemetThesaurus
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchOptions
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldHaveAtLeastSize
import io.kotest.matchers.shouldBe

class GemetThesaurusTest : ShouldSpec({
    val searchOptions = ThesaurusSearchOptions(ThesaurusSearchType.CONTAINS)
    val searchOptionsExact = ThesaurusSearchOptions(ThesaurusSearchType.EXACT)
    val thesaurus = SNSGemetThesaurus()

    should("return an empty list when search with empty string") {
        thesaurus.search("", searchOptions) shouldBe emptyList()
    }
    should("return a single match to a given string with exact search") {
        thesaurus.search("Wald", searchOptionsExact) shouldBe listOf(Keyword("http://www.eionet.europa.eu/gemet/concept/9349", "Wald", null))
    }
    should("return a list of matches to a given string with contains search") {
        val results = thesaurus.search("Wald", searchOptions) 
        results shouldHaveAtLeastSize 10
    }
})