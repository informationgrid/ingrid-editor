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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
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
            if (hit._type != null) {
                statsPerType.putIfAbsent(
                    hit._type,
                    StatisticResponse(
                        totalNum = 0,
                        numDrafts = 0,
                        numPublished = 0,
                        statsPerType = null,
                    ),
                )

                val statsType = statsPerType[hit._type]!!
                statsType.totalNum = statsType.totalNum!! + 1
                if (hit._state == "PW" || hit._state == "P") {
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
}
