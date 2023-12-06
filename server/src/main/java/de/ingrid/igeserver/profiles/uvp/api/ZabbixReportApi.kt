package de.ingrid.igeserver.profiles.uvp.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
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
}

data class ProblemReportItem(
    val problemUrl: String,
    val clock: String,
    val docName: String,
    val name: String,
    val url: String,
    val docUrl: String,
    val docUuid: String,
)