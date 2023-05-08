/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import java.security.Principal

@Tag(name = "Export", description = "the export API")
interface ExportApi {
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @PostMapping(value = ["/export"], produces = ["application/zip"])
    fun export(
        principal: Principal,
        @Parameter(
            description = "The dataset to be exported.",
            required = true
        ) @RequestBody data: @Valid ExportRequestParameter
    ): ResponseEntity<ByteArray?>

    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The supported types for export."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @GetMapping(value = ["/export"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun exportTypes(
        principal: Principal,
        @Parameter(description = "The catalog profile to get the supported export types from.") @RequestParam(value = "profile") profile: String
    ): ResponseEntity<List<ExportTypeInfo>>
}