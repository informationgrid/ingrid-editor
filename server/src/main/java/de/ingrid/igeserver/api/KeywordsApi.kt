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
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import java.util.*

@Hidden
@Tag(name = "Keywords")
interface KeywordsApi {
    @ApiResponses(value = [ApiResponse(responseCode = "200")])
    @GetMapping(value = ["/keywords/{thesaurusId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun search(
        @Parameter(required = true) @PathVariable("thesaurusId") thesaurusId: String,
        @RequestParam(value = "q", required = true) term: String,
        @RequestParam(value = "type", required = false) type: ThesaurusSearchType? = ThesaurusSearchType.CONTAINS,
    ): ResponseEntity<List<Keyword>>
}
