/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Tag(name = "Codelist", description = "the codelist API")
interface CodelistApi {

    @Operation
    @RequestMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    fun getAllCodelists(): ResponseEntity<List<CodeList>>

    @Operation
    @RequestMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.POST])
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    fun updateCodelists(): ResponseEntity<List<CodeList>>

    @Operation
    @RequestMapping(value = ["/{ids}"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    fun getCodelistsByIds(
        principal: Principal?,
        @Parameter(description = "The ID of the codelists.", required = true) @PathVariable("ids") ids: List<String>
    ): ResponseEntity<List<CodeList>>

    @Operation
    @GetMapping(value = ["/manage"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    fun getCatalogCodelists(principal: Principal?): ResponseEntity<List<CodeList>>

    @Operation
    @PutMapping(value = ["/manage/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    fun updateCatalogCodelist(
        principal: Principal?,
        @Parameter() @PathVariable id: String,
        @Parameter() @RequestBody codelist: Codelist
    ): ResponseEntity<Codelist>

}
