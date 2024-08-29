/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
        value = [
            ApiResponse(responseCode = "200", description = ""), ApiResponse(
                responseCode = "500",
                description = "Unexpected error",
            ),
        ],
    )
    @PostMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getReport(
        principal: Principal,
        @Parameter(
            description = "The catalog ID and the cron pattern for which the configuration is saved",
            required = true,
        )
        @RequestBody activityQueryOptions: @Valid ActivityQueryOptions,
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
