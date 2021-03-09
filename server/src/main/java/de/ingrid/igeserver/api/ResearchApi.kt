package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.*
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
    @GetMapping(value = ["/"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun load(principal: Principal?): ResponseEntity<Array<ResearchQuery>>

    @Operation
    @PostMapping(value = ["/"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun save(principal: Principal?): ResponseEntity<Void>

    @Operation
    @DeleteMapping(value = ["/"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun delete(principal: Principal?): ResponseEntity<Void>

    @Operation
    @PostMapping(value = ["/query"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun search(principal: Principal?,
               @Parameter(description = "the query with filter definitions") @RequestBody query: ResearchQuery): ResponseEntity<ResearchResponse>
    
    @Operation
    @PostMapping(value = ["/querySql"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun searchSql(principal: Principal?,
               @Parameter(description = "the sql query") @RequestBody sqlQuery: String): ResponseEntity<ResearchResponse>

    @Operation
    @GetMapping(value = ["/quickFilter"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun getQuickFilter(principal: Principal?): ResponseEntity<Array<FacetGroup>>

    @Operation
    @PostMapping(value = ["/export"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun export(principal: Principal?): ResponseEntity<Any>

}