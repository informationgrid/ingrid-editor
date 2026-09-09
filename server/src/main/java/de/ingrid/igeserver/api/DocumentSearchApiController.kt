/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.model.CoupledServiceSearchRequest
import de.ingrid.igeserver.model.HmbtgDocumentTitlesRequest
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.model.TitleOrUuidSearchRequest
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentSearchService
import io.swagger.v3.oas.annotations.Hidden
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@Hidden
@RestController
@RequestMapping(path = ["/api/search"], produces = [MediaType.APPLICATION_JSON_VALUE])
class DocumentSearchApiController(
    private val searchService: DocumentSearchService,
    private val catalogService: CatalogService,
) {
    @PostMapping("/titleOrUuid")
    fun titleOrUuid(principal: Principal, @Valid @RequestBody request: TitleOrUuidSearchRequest): ResearchResponse = searchService.findInTitleOrUuid(
        catalogService.getCurrentCatalogForPrincipal(principal),
        principal,
        request,
    )

    @PostMapping("/hasCoupledServiceWithGetCapabilities")
    fun hasCoupledServiceWithGetCapabilities(principal: Principal, @RequestBody request: CoupledServiceSearchRequest): Boolean = searchService.hasCoupledServiceWithGetCapabilities(
        catalogService.getCurrentCatalogForPrincipal(principal),
        principal,
        request.uuid,
    )

    @PostMapping("/hmbtgDocumentTitles")
    fun hmbtgDocumentTitles(principal: Principal, @RequestBody request: HmbtgDocumentTitlesRequest): List<String> = searchService.getHmbtgDocumentTitles(
        catalogService.getCurrentCatalogForPrincipal(principal),
        principal,
        request.uuids,
    )
}
