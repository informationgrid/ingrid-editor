package de.ingrid.igeserver.profiles.uvp.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import java.security.Principal

@Tag(name = "UVP Report", description = "API to create UVP reports")
interface UvpReportApi {

    @Operation
    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun getUvpReport(
        principal: Principal,
        @Parameter(
            description = "'From' Date as ISO Datestring",
            required = false
        ) @RequestParam(value = "from") from: String?,
        @Parameter(
            description = "'To' Date as ISO Datestring",
            required = false
        ) @RequestParam(value = "to") to: String?,
    ): ResponseEntity<UvpReport>
}
