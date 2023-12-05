package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.configuration.ZabbixProperties
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.zabbix.ZabbixService
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/uvp/zabbix-report"])
@Profile("zabbix")
class ZabbixReportApiController(
    val zabbixService: ZabbixService,
    val zabbixProperties: ZabbixProperties,
    val catalogService: CatalogService,
) : ZabbixReportApi {
    override fun getReport(principal: Principal): ResponseEntity<List<ProblemReportItem>> {
        val catalogIdentifier = catalogService.getCurrentCatalogForPrincipal(principal)
        // assumes apiURL is like https://zabbix.example.com/api_jsonrpc.php
        val zabbixBaseUrl = zabbixProperties.apiURL.replace("/api_jsonrpc.php", "")
        return zabbixService.getProblems(catalogIdentifier).map { problem ->
            ProblemReportItem(
                problemUrl = zabbixBaseUrl + "/tr_events.php?triggerid=${problem.objectid}&eventid=${problem.eventid}",
                clock = problem.clock,
                docName = problem.docName,
                name = problem.name,
                url = problem.url,
                docUrl = problem.docUrl,
                docUuid = problem.docUuid,
            )
        }.let { ResponseEntity.ok(it) }
    }


}

