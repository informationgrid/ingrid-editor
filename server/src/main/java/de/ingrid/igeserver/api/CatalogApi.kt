/*
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Catalogs", description = "Handle catalog requests")
interface CatalogApi {
    @GetMapping(value = ["/catalogs"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get all catalogs")
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "200",
            description = "Unexpected error"
        )]
    )
    fun catalogs(): ResponseEntity<List<de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog>>

    // @PreAuthorize("hasRole('admin')")
    @PostMapping(value = ["/catalogs"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    fun createCatalog(
        @Parameter(
            description = "The settings of the catalog to create.",
            required = true
        ) @RequestBody settings: Catalog
    ): ResponseEntity<Catalog>

    @PutMapping(value = ["/catalogs/{name}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    fun updateCatalog(
        @Parameter(
            description = "The name of the catalog to update.",
            required = true
        ) @PathVariable("name") name: String,
        @Parameter(
            description = "The settings of the catalog to update.",
            required = true
        ) @RequestBody settings: Catalog
    ): ResponseEntity<Void>

    @DeleteMapping(value = ["/catalogs/{name}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "404", description = "Unknown database")])
    fun deleteCatalog(
        @Parameter(
            description = "The name of the catalog to delete.",
            required = true
        ) @PathVariable("name") name: String
    ): ResponseEntity<Void>

    @GetMapping(value = ["/catalogStatistic/{identifier}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get static of a catalog")
    fun catalogStatistic(@PathVariable identifier: String): ResponseEntity<CatalogStatistic>
}