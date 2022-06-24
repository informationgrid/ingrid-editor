package de.ingrid.igeserver.profiles.uvp.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import java.security.Principal

@Tag(name = "UVP Report", description = "API to create UVP reports")
interface UploadCheckApi {

    @Operation
    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun checkUploads(
        principal: Principal
    ): ResponseEntity<List<UploadCheckReport>>
}

data class UploadCheckReport(
    val catalogId: String,
    val url: String,
    val valid: Boolean,
    val uuid: String,
    val state: String,
    val error: String? = null
)