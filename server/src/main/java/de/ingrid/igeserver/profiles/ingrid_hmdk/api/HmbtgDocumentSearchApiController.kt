/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
package de.ingrid.igeserver.profiles.ingrid_hmdk.api

import de.ingrid.igeserver.profiles.ingrid_hmdk.services.HmbtgDocumentSearchService
import de.ingrid.igeserver.profiles.ingrid_hmdk.services.HmbtgDocumentTitlesRequest
import de.ingrid.igeserver.services.CatalogService
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/ingrid-hmdk/search"], produces = [MediaType.APPLICATION_JSON_VALUE])
class HmbtgDocumentSearchApiController(
    private val catalogService: CatalogService,
    private val searchService: HmbtgDocumentSearchService,
) {
    /**
     * Retrieves document titles for documents with the publicationHmbTG flag set to true.
     * 
     * This endpoint filters documents by their UUIDs and the publicationHmbTG property,
     * returning only the titles of matching documents that the current user has permission to read.
     * 
     * @param principal The authenticated user
     * @param request The request containing the list of UUIDs to search for
     * @return List of document titles for the matching UUIDs
     */
    @PostMapping("/hmbtgDocumentTitles")
    fun hmbtgDocumentTitles(principal: Principal, @RequestBody request: HmbtgDocumentTitlesRequest): List<String> = searchService.getDocumentTitles(catalogService.getCurrentCatalogForPrincipal(principal), principal, request.uuids)
}
