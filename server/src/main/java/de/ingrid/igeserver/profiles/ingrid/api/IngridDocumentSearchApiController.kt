/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
package de.ingrid.igeserver.profiles.ingrid.api

import de.ingrid.igeserver.profiles.ingrid.CoupledServiceSearchRequest
import de.ingrid.igeserver.profiles.ingrid.IngridDocumentSearchService
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
    @PostMapping("/hasCoupledServiceWithGetCapabilities")
    fun hasCoupledServiceWithGetCapabilities(principal: Principal, @RequestBody request: CoupledServiceSearchRequest): Boolean = searchService.hasCoupledServiceWithGetCapabilities(catalogService.getCurrentCatalogForPrincipal(principal), principal, request.uuid)
}
