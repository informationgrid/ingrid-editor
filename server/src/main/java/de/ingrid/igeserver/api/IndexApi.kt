package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import java.security.Principal
import javax.validation.Valid

@Tag(name = "Index", description = "the Indexing API")
interface IndexApi {
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @RequestMapping(value = ["/index"], produces = ["application/json"], method = [RequestMethod.POST])
    fun startIndexing(
            principal: Principal?,
            @Parameter(description = "The catalog ID for which the indexing process should be started", required = true)
            @RequestBody options: @Valid IndexRequestOptions): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @RequestMapping(value = ["/index/config"], produces = ["application/json"], method = [RequestMethod.POST])
    fun setConfig(
            principal: Principal?,
            @Parameter(description = "The catalog ID for which the configuration is saved", required = true)
            @RequestBody config: @Valid IndexConfigOptions): ResponseEntity<Void>
}