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
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import java.security.Principal

@Tag(name = "Zabbix Report", description = "API to create Zabbix reports")
@Profile("zabbix")
interface ZabbixReportApi {

    @Operation
    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun getReport(
        principal: Principal
    ): ResponseEntity<List<ProblemReportItem>>


    @Operation
    @GetMapping(value = ["/{datasetId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun getDatasetReport(
        principal: Principal,
        @Parameter(description = "The dataset ID for which the report should be gathered", required = true)
        @PathVariable datasetId: Int
    ): ResponseEntity<List<ProblemReportItem>>
}

data class ProblemReportItem(
    val problemUrl: String,
    val clock: String,
    val docName: String,
    val name: String,
    val url: String,
    val docUrl: String,
    val docUuid: String,
    val resolved: Boolean
)