package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ResearchService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager
import javax.persistence.Query

@RestController
@RequestMapping(path = ["/api/uvp/report"])
class UvpReportApiController @Autowired constructor(
    val entityManager: EntityManager,
    val catalogService: CatalogService,
) : UvpReportApi {

    data class TimeRange(
        val from: String,
        val to: String,
    )

    override fun getUvpReport(
        principal: Principal,
        from: String?,
        to: String?
    ): ResponseEntity<UvpReport> {
        checkPermission(principal)
        val catalogID = catalogService.getCatalogById(catalogService.getCurrentCatalogForPrincipal(principal)).id!!
        val report = UvpReport(
            eiaStatistic = this.getEiaNumberStatistics(catalogID, from, to),
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
    ): MutableList<Any?> {
        val GROUPED_EIA_COUNT_SQL = """
        SELECT jsonb_array_elements(document1.data->'eiaNumbers') ->> 'key' as eia, Count(*) AS num
        FROM document_wrapper
                 JOIN document document1 ON
            CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
        WHERE document_wrapper.catalog_id = $catalogID
        AND jsonb_array_length(data -> 'eiaNumbers') > 0        
        """
        val customOrder = """
        GROUP BY eia
        ORDER BY num DESC
        """

        val nativeQuery = getQueryWithTimeFilterAndSuffix(GROUPED_EIA_COUNT_SQL, from, to, null, customOrder)


        return (nativeQuery.resultList)
    }

    fun getSuccessfulPrelimCount(catalogID: Int, from: String?, to: String?): Number {
        val PRELIM_COUNT_SQL = """
        SELECT Count(*)
        FROM document_wrapper
        JOIN document document1 ON
        CASE
        WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
        ELSE document_wrapper.draft = document1.id
        END
        WHERE document_wrapper.catalog_id = $catalogID
        AND document1.data -> 'prelimAssessment' = 'true'
        """

        val nativeQuery = getQueryWithTimeFilter(PRELIM_COUNT_SQL, from, to)


        return (nativeQuery.singleResult as Number).toInt()
    }

    fun getNegativePrelimCount(catalogID: Int, from: String?, to: String?): Number {
        val NEGATIVE_PRELIM_COUNT_SQL = """
        SELECT Count(*)
        FROM document_wrapper
                 JOIN document document1 ON
            CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
        WHERE document_wrapper.catalog_id = $catalogID
        AND document_wrapper.type = 'UvpNegativePreliminaryAssessmentDoc'
        """

        val nativeQuery =
            getQueryWithTimeFilter(NEGATIVE_PRELIM_COUNT_SQL, from, to, "(document1.data ->> 'decisionDate')")
        return (nativeQuery.singleResult as Number).toInt()
    }

    fun getAverageProcedureDuration(catalogID: Int, from: String?, to: String?): Number {
        val PROCEDURE_DATES_SQL = """
        SELECT (document1.data ->> 'receiptDate') as receiptDate, (document1.data -> 'processingSteps' -> -1 ->>'decisionDate') as decisionDate
        FROM document_wrapper
                 JOIN document document1 ON
            CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
        WHERE document_wrapper.catalog_id = $catalogID
        AND jsonb_array_length(data -> 'processingSteps') > 0
        AND (document1.data -> 'receiptDate') != 'null'
        """

        val nativeQuery = getQueryWithTimeFilter(PROCEDURE_DATES_SQL, from, to)

        @Suppress("UNCHECKED_CAST") val queryResults = nativeQuery.resultList as List<Array<out Any?>>
        var totalDuration: Long = 0;
        queryResults.forEach {
            val receiptDate = LocalDateTime.parse(it[0] as String, DateTimeFormatter.ISO_DATE_TIME)
            val decisionDate = LocalDateTime.parse(it[1] as String, DateTimeFormatter.ISO_DATE_TIME)
            totalDuration += decisionDate.toEpochSecond(ZoneOffset.UTC) - receiptDate.toEpochSecond(ZoneOffset.UTC)
        }
        return if (queryResults.isEmpty()) 0 else totalDuration / queryResults.size
    }


    fun checkPermission(principal: Principal) {
        catalogService.getPermissions(principal as Authentication).let {
            if (!it.contains("can_create_uvp_report")) throw Exception("User has no permission to create uvp report")
        }
    }

    fun getQueryWithTimeFilter(sql: String, from: String?, to: String?): Query {
        return getQueryWithTimeFilter(sql, from, to, null)
    }

    fun getQueryWithTimeFilter(sql: String, from: String?, to: String?, customDateField: String?): Query {
        return getQueryWithTimeFilterAndSuffix(sql, from, to, customDateField, null)
    }

    fun getQueryWithTimeFilterAndSuffix(
        sql: String,
        from: String?,
        to: String?,
        customDateField: String?,
        suffix: String?
    ): Query {
        val dateField = customDateField ?: "(document1.data -> 'processingSteps' -> -1 ->>'decisionDate')"
        var sqlWithTime = "$sql AND $dateField != 'null'"

        if (from != null) sqlWithTime += " AND $dateField >= :fromDate"
        if (to != null) sqlWithTime += " AND $dateField <= :toDate"

        if (suffix != null) sqlWithTime += suffix

        val nativeQuery = entityManager.createNativeQuery(sqlWithTime)
        if (from != null) nativeQuery.setParameter("fromDate", from)
        if (to != null) nativeQuery.setParameter("toDate", to)

        return nativeQuery
    }


}

