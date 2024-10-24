/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
        thesaurus.search("Wald", searchOptionsExact) shouldBe listOf(Keyword("http://www.eionet.europa.eu/gemet/concept/9349", "Wald", "wood"))
    }
    should("return a list of matches to a given string with contains search") {
        val results = thesaurus.search("Wald", searchOptions)
        results shouldHaveAtLeastSize 10
    }
})
