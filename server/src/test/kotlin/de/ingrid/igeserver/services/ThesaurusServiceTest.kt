package de.ingrid.igeserver.services

import de.ingrid.igeserver.services.thesaurus.Keyword
import de.ingrid.igeserver.services.thesaurus.SNSUbaUmthesThesaurus
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchOptions
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldHaveAtLeastSize
import io.kotest.matchers.shouldBe

class ThesaurusServiceTest : ShouldSpec({
    val searchOptions = ThesaurusSearchOptions(ThesaurusSearchType.CONTAINS)

    should("return an empty list when search with empty string") {
        SNSUbaUmthesThesaurus().search("", searchOptions) shouldBe emptyList()
    }
    should("return a single matche to a given string with exact search") {
        SNSUbaUmthesThesaurus().search("Wald", searchOptions) shouldBe listOf(Keyword("https://sns.uba.de/umthes/TH_00028708", "Wald"))
    }
    xshould("return a list of matches to a given string with contains search") {
        val results = SNSUbaUmthesThesaurus().search("Wald", searchOptions) 
        results shouldHaveAtLeastSize 10
    }
})