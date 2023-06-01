package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Tag(name = "Research", description = "extensive Search API")
interface ResearchApi {

    @Operation
    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    @ResponseBody
    fun load(principal: Principal): ResponseEntity<List<Query>>

    @Operation
    @PostMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun save(
        principal: Principal,
        @Parameter(description = "The dataset to be stored.", required = true) @RequestBody query: Query
    ): ResponseEntity<Query>

    @Operation
    @DeleteMapping(value = ["query/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun delete(
        principal: Principal,
        @Parameter(description = "The id of the query to be deleted") @PathVariable id: Int
    ): ResponseEntity<Void>

    @Operation
    @PostMapping(value = ["/query"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun search(
        principal: Principal,
        @Parameter(description = "the query with filter definitions") @RequestBody query: ResearchQuery
    ): ResponseEntity<ResearchResponse>

    @Operation
    @PostMapping(value = ["/querySql"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun searchSql(
        principal: Principal,
        @Parameter(description = "the sql query") @RequestBody sqlQuery: String,
        @Parameter(description = "the page of the results") @RequestParam page: Int?,
        @Parameter(description = "the size of the results to show") @RequestParam pageSize: Int?,
    ): ResponseEntity<ResearchResponse>

    @Operation
    @GetMapping(value = ["/quickFilter"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun getQuickFilter(principal: Principal): ResponseEntity<Facets>

    @Operation
    @PostMapping(value = ["/export"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun export(principal: Principal): ResponseEntity<Any>

    @Operation
    @PostMapping(value = ["/geothesaurus/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun geoSearch(principal: Principal, @RequestBody query: String): ResponseEntity<Any>

}