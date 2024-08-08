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
        val catalogId = catalogService.getCatalogById(catalogIdentifier).id

        val nativeQuery = entityManager.createNativeQuery(getActivitySql(catalogIdentifier, activityQueryOptions, catalogId))
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
    fun getActivitySql(catalogIdentifier: String, activityQueryOptions: ActivityQueryOptions, catalogId: Int?) = """
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
          AND (document.catalog_id=$catalogId OR document.catalog_id IS NULL)
          ${activityQueryOptions.from?.let { "AND timestamp >= '$it'" } ?: ""}
          ${activityQueryOptions.to?.let { "AND timestamp <= '$it'" } ?: ""}
          ${(activityQueryOptions.actions?.let { if (it.isNotEmpty()) "AND message->>'action' IN (${it.joinToString(",") { "'$it'" }})" else "" }) ?: ""}
        ORDER BY audit_log.id DESC;
    """.trimIndent()


}

