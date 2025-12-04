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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.api.FreeEntryUsage
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class CodelistUsageService(
    private val jdbcTemplate: JdbcTemplate,
) {

    private val log = logger()

    private val sqlFreeEntriesWithCounts = """
        SELECT matches #>> '{}' AS value, COUNT(*)::int AS count
        FROM document d
        JOIN document_wrapper dw ON d.uuid = dw.uuid AND d.catalog_id = dw.catalog_id
        JOIN catalog c ON dw.catalog_id = c.id
        , LATERAL jsonb_path_query(
            d.data,
            '${'$'}.** ? (@.key == null && @."_codelistId" == ${'$'}cid).value',
            CAST(? AS jsonb)
        ) AS matches
        WHERE c.identifier = ?
          AND dw.deleted = 0
          AND d.state != 'ARCHIVED'
          AND jsonb_typeof(matches) = 'string'
          AND (matches #>> '{}') IS NOT NULL
          AND (matches #>> '{}') <> ''
        GROUP BY value
        ORDER BY value
    """.trimIndent()

    fun getFreeEntriesWithCountsForCodelist(
        catalogIdentifier: String,
        codelistId: String,
    ): List<FreeEntryUsage> {
        val vars = """{"cid":"$codelistId"}"""
        return try {
            jdbcTemplate.query(sqlFreeEntriesWithCounts, { rs, _ ->
                FreeEntryUsage(
                    rs.getString("value"),
                    rs.getInt("count"),
                )
            }, vars, catalogIdentifier)
        } catch (e: Exception) {
            log.error(
                "Error fetching free entry counts for codelist $codelistId in catalog $catalogIdentifier: ${e.message}",
            )
            emptyList()
        }
    }
}
