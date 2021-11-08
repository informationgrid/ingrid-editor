/*
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FrontendConfiguration
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping

@Tag(name = "Config", description = "the configs API")
interface ConfigApi {
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Frontend configuration")])
    @GetMapping(value = ["/config"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun get(): ResponseEntity<FrontendConfiguration>

}
