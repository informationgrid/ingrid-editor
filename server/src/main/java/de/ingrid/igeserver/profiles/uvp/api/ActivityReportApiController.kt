package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.services.CatalogService
import jakarta.persistence.EntityManager
import org.intellij.lang.annotations.Language
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.Instant

@RestController
@RequestMapping(path = ["/api/uvp/activity-report"])
@Profile("uvp")
class ActivityReportApiController(
    val entityManager: EntityManager,
    val catalogService: CatalogService,
) : ActivityReportApi {
    override fun getReport(
        principal: Principal,
        activityQueryOptions: ActivityQueryOptions
    ): ResponseEntity<List<ActivityReportItem>> {
        val catalogIdentifier = catalogService.getCurrentCatalogForPrincipal(principal)

        val nativeQuery = entityManager.createNativeQuery(getActivitySql(catalogIdentifier, activityQueryOptions))
        val resultList = nativeQuery.resultList as List<Array<out Any?>>


        return ResponseEntity.ok(resultList.map {
            ActivityReportItem(
                time = it[0] as Instant,
                dataset_uuid = it[1] as String,
                title = it[2] as String,
                document_type = it[3] as String,
                contact_uuid = it[4] as String?,
                contact_name = it[5] as String?,
                actor = it[6] as String,
                action = it[7] as String
            )
        })
    }

    @Language("PostgreSQL")
    fun getActivitySql(catalogIdentifier: String, activityQueryOptions: ActivityQueryOptions) = """
        SELECT
            timestamp,
            message->>'target' as dataset_uuid,
            message#>>'{data,title}' as title,
            message#>>'{data,_type}' as document_type,
            message#>'{data,pointOfContact}'->0->>'ref' as contact_uuid,
            document.title as contact_name,
            message->>'actor' as actor,
            message->>'action' as action
        FROM audit_log LEFT JOIN document ON message#>'{data,pointOfContact}'->0->>'ref' = document.uuid
        WHERE message @> '{"cat": "data-history","catalogIdentifier": "$catalogIdentifier"}'
          AND message#>>'{data,_type}' NOT IN ('UvpOrganisationDoc', 'UvpAddressDoc', 'FOLDER')
          ${activityQueryOptions.from?.let { "AND timestamp >= '$it'" } ?: ""}
          ${activityQueryOptions.to?.let { "AND timestamp <= '$it'" } ?: ""}
          ${(activityQueryOptions.actions?.let { if (it.isNotEmpty()) "AND message->>'action' IN (${it.joinToString(",") { "'$it'" }})" else "" }) ?: ""}
        ORDER BY audit_log.id DESC;
    """.trimIndent()


}

