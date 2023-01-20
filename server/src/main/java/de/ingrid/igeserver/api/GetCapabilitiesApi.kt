package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@Tag(name = "GetCapabilities", description = "the groups API")
interface GetCapabilitiesApi {
    @Operation(description = "")
    @PostMapping(
        value = ["/analyzeGetRecordUrl"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun analyzeGetRecordUrl(
        @Parameter(description = "Save the group into the database.", required = true) @RequestBody url: String
    ): ResponseEntity<GetRecordUrlAnalysis>
}