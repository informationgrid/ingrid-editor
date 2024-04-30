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

import de.ingrid.igeserver.configuration.ZabbixProperties
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.zabbix.ZabbixModel
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
    zabbixProperties: ZabbixProperties,
    val catalogService: CatalogService,
    val documentService: DocumentService,
) : ZabbixReportApi {
    private final val ZABBIX_BASE_URL = zabbixProperties.apiURL.replace("/api_jsonrpc.php", "")
    override fun getReport(principal: Principal): ResponseEntity<List<ProblemReportItem>> {
        val catalogIdentifier = catalogService.getCurrentCatalogForPrincipal(principal)
        // assumes apiURL is like https://zabbix.example.com/api_jsonrpc.php
        return zabbixService.getProblems(catalogIdentifier).map {
            problemToReportItem(it)
        }.filter {
            // filter out documents that the principal does not have access to
            try {
                // throws an exception if the document does not exist or the principal does not have sufficient rights
                documentService.getWrapperByCatalogAndDocumentUuid(catalogIdentifier, it.docUuid)
                true
            } catch (e: Exception) {
                false
            }
        }.let { ResponseEntity.ok(it) }
    }

    override fun getDatasetReport(principal: Principal, datasetId: Int): ResponseEntity<List<ProblemReportItem>> {
        val uuid = documentService.getWrapperById(datasetId).uuid
        val triggerIds = zabbixService.getTriggerIds(uuid)
        val problems = triggerIds
            .mapNotNull {
                val events = zabbixService.getTriggerEvents(it)
                val lastEvent = events?.get(0) ?: return@mapNotNull null
                if(lastEvent.severity != "0") {
                    // latest event is a problem
                    problemToReportItem(lastEvent)
                } else {
                    // latest event is a resolution, so we need to check the previous event
                    if (events.size < 2) return@mapNotNull null
                    val previousEvent = events[1]
                    problemToReportItem(previousEvent, resolved = true)
                }
            }
        return ResponseEntity.ok(problems)
    }


    fun problemToReportItem(problem: ZabbixModel.Problem, resolved: Boolean=false): ProblemReportItem {
        return ProblemReportItem(
            problemUrl = ZABBIX_BASE_URL + "/tr_events.php?triggerid=${problem.objectid}&eventid=${problem.eventid}",
            clock = problem.clock,
            docName = problem.docName,
            name = problem.name,
            url = problem.url,
            docUrl = problem.docUrl,
            docUuid = problem.docUuid,
            resolved =  resolved
        )
    }


}

