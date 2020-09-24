/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.StatisticResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import java.security.Principal

@Tag(name = "Statistic", description = "the statistic API")
interface StatisticApi {
    @Operation
    @RequestMapping(value = ["/statistic"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "200", description = "Unexpected error")])
    fun getStatistic(principal: Principal?): ResponseEntity<StatisticResponse>
}