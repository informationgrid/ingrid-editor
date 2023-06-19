/*
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FrontendConfiguration
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody

@Tag(name = "Config", description = "the configs API")
interface ConfigApi {
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Frontend configuration")])
    @GetMapping(value = ["/config"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun get(): ResponseEntity<FrontendConfiguration>

    @GetMapping(value = ["/config/ibus"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getIBus(): ResponseEntity<List<IBusConfig>>

    @GetMapping(value = ["/config/ibus/connected/{index}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun isConnected(@PathVariable index: Int): ResponseEntity<Boolean>
    
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Settings have been set.")])
    @PutMapping(value = ["/config/ibus"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setIBus(@Parameter(required = true) @RequestBody config: List<IBusConfig>): ResponseEntity<Unit>
}
