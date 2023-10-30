package de.ingrid.igeserver.api

import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@Hidden
@Tag(name = "Tools")
interface ToolsApi {

    @Operation
    @PostMapping(value = ["/validate/wkt"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200")])
    fun validWkt(
        @Parameter(
            description = "The wkt string to check",
            required = true
        ) @RequestBody wkt: String
    ): ResponseEntity<WktValidateResponse>

}

data class WktValidateResponse(val isValid: Boolean, val message: String? = null)