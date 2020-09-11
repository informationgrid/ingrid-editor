/*
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Behaviour
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import java.security.Principal

@Tag(name = "Behaviours", description = "the behaviours API")
interface BehavioursApi {
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Behaviours are returned.")])
    @RequestMapping(value = ["/behaviours"], produces = ["application/json"], method = [RequestMethod.GET])
    fun getBehaviours(principal: Principal?): ResponseEntity<List<Behaviour>>

    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Behaviours have been set.")])
    @RequestMapping(value = ["/behaviours"], produces = ["application/json"], method = [RequestMethod.POST])
    fun setBehaviours(principal: Principal?, @Parameter(required = true) @RequestBody behaviours: List<Behaviour>): ResponseEntity<Void>
}