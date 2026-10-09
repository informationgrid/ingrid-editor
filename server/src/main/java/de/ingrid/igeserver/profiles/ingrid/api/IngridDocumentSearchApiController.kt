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
package de.ingrid.igeserver.profiles.ingrid.api

import de.ingrid.igeserver.profiles.ingrid.services.CoupledServiceSearchRequest
import de.ingrid.igeserver.profiles.ingrid.services.IngridDocumentSearchService
import de.ingrid.igeserver.services.CatalogService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/ingrid/search"], produces = [MediaType.APPLICATION_JSON_VALUE])
class IngridDocumentSearchApiController(
    private val catalogService: CatalogService,
    private val searchService: IngridDocumentSearchService,
) {
    /**
     * Checks if a document has a coupled service with GetCapabilities operation.
     * 
     * This endpoint verifies whether the document with the given UUID has a coupled resource
     * that includes a GetCapabilities operation (operation name key = '1').
     * 
     * @param principal The authenticated user
     * @param request The request containing the document UUID to check
     * @return true if the document has a coupled service with GetCapabilities, false otherwise
     */
    @PostMapping("/hasCoupledServiceWithGetCapabilities")
    fun hasCoupledServiceWithGetCapabilities(principal: Principal, @RequestBody request: CoupledServiceSearchRequest): Boolean = searchService.hasCoupledServiceWithGetCapabilities(catalogService.getCurrentCatalogForPrincipal(principal), principal, request.uuid)
}
