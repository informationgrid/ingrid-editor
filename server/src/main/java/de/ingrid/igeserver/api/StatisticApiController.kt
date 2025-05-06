/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.AuthUtils
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class StatisticApiController(
    val researchService: ResearchService,
    val authUtils: AuthUtils,
    val catalogService: CatalogService,
) : StatisticApi {

    override fun getStatistic(principal: Principal): ResponseEntity<StatisticResponse> {
        val documentFilter = BoolFilter("AND", listOf("selectDocuments", "exceptFolders"), null, null, true)
        val emptyQuery = ResearchQuery(null, documentFilter)
        val result = getStatisticForQuery(principal, emptyQuery)
        return ResponseEntity.ok(result)

        // TODO-DW: check improvement
//        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
//
//        val userName = authUtils.getUsernameFromPrincipal(principal)
//        val userGroups = catalogService.getUser(userName)?.groups ?: emptySet()
//        val allDrafts = researchService.query(
//            principal, userGroups, catalogId,
//            ResearchQuery(
//                null, BoolFilter("AND", listOf("selectDocuments", "selectDraft", "exceptFolders"), null, null),
//                pagination = ResearchPaging(pageSize = 1)
//            )
//        )
//        val allPublished = researchService.query(
//            principal, userGroups, catalogId,
//            ResearchQuery(
//                null, BoolFilter("AND", listOf("selectDocuments", "selectPublished", "exceptFolders"), null, null),
//                pagination = ResearchPaging(pageSize = 1)
//            )
//        )
//        val total = researchService.query(
//            principal, userGroups, catalogId,
//            ResearchQuery(
//                null, BoolFilter("AND", listOf("selectDocuments", "exceptFolders"), null, null),
//                pagination = ResearchPaging(pageSize = 10)
//            )
//        )
//        // TODO: fix calculation of total
//
//        return ResponseEntity.ok(
//            StatisticResponse(
//                total.totalHits.toLong(),
//                allPublished.totalHits.toLong(),
//                allDrafts.totalHits.toLong()
//            )
//        )
    }

    override fun searchStatistic(principal: Principal, query: ResearchQuery): ResponseEntity<StatisticResponse> {
        val result = getStatisticForQuery(principal, query)
        return ResponseEntity.ok(result)
    }

    private fun getStatisticForQuery(
        principal: Principal,
        query: ResearchQuery,
    ): StatisticResponse {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        val queryResult = researchService.query(dbId, query, principal)

        val allData = queryResult.totalHits.toLong()
        var allDataDrafts: Long = 0
        var allDataPublished: Long = 0
        val statsPerType = mutableMapOf<String, StatisticResponse>()
        queryResult.hits.forEach { hit ->
            if (hit.type != null) {
                statsPerType.putIfAbsent(
                    hit.type,
                    StatisticResponse(
                        totalNum = 0,
                        numDrafts = 0,
                        numPublished = 0,
                        statsPerType = null,
                    ),
                )

                val statsType = statsPerType[hit.type]!!
                statsType.totalNum = statsType.totalNum!! + 1
                if (hit.state == "PW" || hit.state == "P") {
                    allDataPublished++
                    statsType.numPublished++
                } else {
                    allDataDrafts++
                    statsType.numDrafts++
                }
            }
        }

        val result = StatisticResponse(
            totalNum = allData,
            numDrafts = allDataDrafts,
            numPublished = allDataPublished,
            statsPerType = statsPerType,
        )
        return result
    }

    @Operation
    @GetMapping(value = ["/statistic/recentDocuments"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun getRecentDocuments(
        principal: Principal,
        @Parameter(description = "") @RequestParam("recentlyPublished") recentlyPublished: Boolean = false,
        @Parameter(description = "") @RequestParam("fromUser") fromUser: Boolean = false,
        @Parameter(description = "") @RequestParam("addresses") addresses: Boolean = false,
    ): ResponseEntity<ResearchResponse> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val userId = catalogService.getUser(authUtils.getUsernameFromPrincipal(principal))?.id

        val typeFilter = if (addresses) "selectAddresses" else "selectDocuments"
        val stateFilter = "document1.state ${if (recentlyPublished) "= 'PUBLISHED'" else " IS NOT NULL"}"
        val userFilter = if (fromUser) "document1.modifiedbyuser = $userId" else null

        val query = getResearchQuery(stateFilter, userFilter, typeFilter)

        return ResponseEntity.ok(researchService.query(dbId, query, principal))
    }

    private fun getResearchQuery(stateFilter: String?, userFilter: String?, typeFilter: String): ResearchQuery = ResearchQuery(
        null,
        BoolFilter(
            "AND",
            null,
            listOfNotNull(stateFilter, userFilter).map { BoolFilter("OR", listOf(it), null, null, isFacet = false) } +
                BoolFilter(
                    "AND",
                    listOf(typeFilter, "exceptFolders"),
                    null,
                    null,
                ),
            null,
        ),
        "modified",
        "DESC",
        ResearchPaging(1, 10),
    )
}
