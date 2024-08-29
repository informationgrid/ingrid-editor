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
        @RequestParam(value = "type") type: ThesaurusSearchType?,
    ): ResponseEntity<List<Keyword>> {
        val result = thesaurusFactory.get(thesaurusId).search(term, ThesaurusSearchOptions(type ?: ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(result)
    }
}
