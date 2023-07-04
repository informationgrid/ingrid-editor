package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.services.CatalogService
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
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
@Profile("uvp")
class UvpReportApiController @Autowired constructor(
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

