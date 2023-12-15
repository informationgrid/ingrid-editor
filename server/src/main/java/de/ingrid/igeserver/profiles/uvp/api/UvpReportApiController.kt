/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import de.ingrid.igeserver.services.CatalogService
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping(path = ["/api/uvp/report"])
class UvpReportApiController(
    val entityManager: EntityManager,
    val catalogService: CatalogService,
) : UvpReportApi {

    override fun getUvpReport(
        principal: Principal,
        from: String?,
        to: String?
    ): ResponseEntity<UvpReport> {
        checkPermission(principal)
        val catalogID = catalogService.getCatalogById(catalogService.getCurrentCatalogForPrincipal(principal)).id!!
        val report = UvpReport(
            eiaStatistic = this.getEiaNumberStatistics(catalogID, from, to),
            procedureCount = this.getProcedureCount(catalogID, from, to),
            negativePreliminaryAssessments = this.getNegativePrelimCount(catalogID, from, to),
            positivePreliminaryAssessments = this.getSuccessfulPrelimCount(catalogID, from, to),
            averageProcedureDuration = this.getAverageProcedureDuration(catalogID, from, to)
        )
        return ResponseEntity.ok(report)
    }

    fun getEiaNumberStatistics(
        catalogID: Int,
        from: String?,
        to: String?
    ): MutableList<Any?> = entityManager.createNativeQuery(getEiaStatisiticSQL(catalogID, from, to)).resultList

    fun getSuccessfulPrelimCount(catalogID: Int, from: String?, to: String?): Number {
        val nativeQuery = entityManager.createNativeQuery(getSuccessfulPrelimCountSQL(catalogID, from, to))
        return (nativeQuery.singleResult as Number).toInt()
    }

    fun getProcedureCount(
        catalogID: Int,
        from: String?,
        to: String?
    ): Number {
        val nativeQuery = entityManager.createNativeQuery(getProcedureCountSQL(catalogID, from, to))
        return (nativeQuery.singleResult as Number).toInt()
    }

    fun getNegativePrelimCount(catalogID: Int, from: String?, to: String?): Number {
        val nativeQuery = entityManager.createNativeQuery(getNegativePrelimCountSQL(catalogID, from, to))
        return (nativeQuery.singleResult as Number).toInt()
    }

    fun getAverageProcedureDuration(catalogID: Int, from: String?, to: String?): Number {
        val nativeQuery = entityManager.createNativeQuery(getReceiptAndLatestDecisionDatesSQL(catalogID, from, to))

        @Suppress("UNCHECKED_CAST") val queryResults = nativeQuery.resultList as List<Array<out Any?>>
        var totalDuration: Long = 0
        queryResults.forEach {
            val receiptDate = LocalDateTime.parse((it[0] ?: it[1]) as String, DateTimeFormatter.ISO_DATE_TIME)
            val decisionDate = LocalDateTime.parse(it[2] as String, DateTimeFormatter.ISO_DATE_TIME)
            totalDuration += decisionDate.toEpochSecond(ZoneOffset.UTC) - receiptDate.toEpochSecond(ZoneOffset.UTC)
        }
        return if (queryResults.isEmpty()) 0 else totalDuration / queryResults.size
    }


    fun checkPermission(principal: Principal) {
        catalogService.getPermissions(principal as Authentication).let {
            if (!it.contains("can_create_uvp_report")) throw Exception("User has no permission to create uvp report")
        }
    }

}

