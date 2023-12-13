package de.ingrid.igeserver.profiles.uvp.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import java.security.Principal
import java.time.Instant

@Tag(name = "Activity Report", description = "API to create Activity reports")
@Profile("uvp")
interface ActivityReportApi {


    @Operation
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    @PostMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getReport(
        principal: Principal,
        @Parameter(
            description = "The catalog ID and the cron pattern for which the configuration is saved",
            required = true
        )
        @RequestBody activityQueryOptions: @Valid ActivityQueryOptions
    ): ResponseEntity<List<ActivityReportItem>>

}

data class ActivityQueryOptions(
    val from: String?,
    val to: String?,
    val actions: List<String>?,
)

data class ActivityReportItem(
    val time: Instant,
    val dataset_uuid: String,
    val title: String,
    val document_type: String,
    val contact_uuid: String?,
    val contact_name: String?,
    val actor: String,
    val action: String,
)