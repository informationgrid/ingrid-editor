package de.ingrid.igeserver.api

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import javax.validation.Valid

@Tag(name = "Index", description = "the Indexing API")
interface IndexApi {
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @PostMapping(value = ["/index"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun startIndexing(
            principal: Principal,
            @Parameter(description = "The catalog ID for which the indexing process should be started", required = true)
            @RequestBody options: @Valid IndexRequestOptions): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @DeleteMapping(value = ["/index/{catalogId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun cancelIndexing(
            principal: Principal,
            @Parameter(description = "The catalog ID for which the indexing process should be started", required = true)
            @PathVariable catalogId: String): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @PostMapping(value = ["/index/config"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setConfig(
            principal: Principal,
            @Parameter(description = "The catalog ID and the cron pattern for which the configuration is saved", required = true)
            @RequestBody config: @Valid IndexConfigOptions): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @GetMapping(value = ["/index/config/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getConfig(
            principal: Principal,
            @Parameter(description = "The catalog ID for which to get the configuration", required = true)
            @PathVariable id: String): ResponseEntity<IndexConfigOptions>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @GetMapping(value = ["/index/log"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLog(principal: Principal): ResponseEntity<IndexMessage>
}