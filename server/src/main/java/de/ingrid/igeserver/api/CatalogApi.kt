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

import de.ingrid.igeserver.model.CatalogConfigRequest
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Hidden
@Tag(name = "Catalogs", description = "Handle catalog requests")
interface CatalogApi {
    @GetMapping(value = ["/catalogs"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get all catalogs")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = ""), ApiResponse(
                responseCode = "500",
                description = "Unexpected error",
            ),
        ],
    )
    fun catalogs(principal: Principal): ResponseEntity<List<Catalog>>

    // @PreAuthorize("hasRole('admin')")
    @PostMapping(value = ["/catalogs"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    fun createCatalog(
        @Parameter(
            description = "The settings of the catalog to create.",
            required = true,
        ) @RequestBody settings: Catalog,
    ): ResponseEntity<Catalog>

    @PutMapping(value = ["/catalogs/{name}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    fun updateCatalog(
        @Parameter(
            description = "The name of the catalog to update.",
            required = true,
        ) @PathVariable("name") name: String,
        @Parameter(
            description = "The settings of the catalog to update.",
            required = true,
        ) @RequestBody settings: Catalog,
    ): ResponseEntity<Void>

    @DeleteMapping(value = ["/catalogs/{name}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "404", description = "Unknown database")])
    fun deleteCatalog(
        @Parameter(
            description = "The name of the catalog to delete.",
            required = true,
        ) @PathVariable("name") name: String,
    ): ResponseEntity<Void>

    @GetMapping(value = ["/catalogStatistic/{identifier}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get statistic of a catalog")
    fun catalogStatistic(@PathVariable identifier: String): ResponseEntity<CatalogStatistic>

    @GetMapping(value = ["/catalogConfig"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get configuration of a catalog")
    fun getCatalogConfig(principal: Principal): ResponseEntity<CatalogConfigRequest>

    @PutMapping(value = ["/catalogConfig"])
    @Operation(responses = [], summary = "Save configuration of a catalog")
    fun saveCatalogConfig(principal: Principal, @RequestBody data: CatalogConfigRequest): ResponseEntity<Unit>
}
