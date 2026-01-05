/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.NullNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.FreeEntryUsage
import de.ingrid.igeserver.api.dto.ReplaceFreeEntryResult
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class CodelistUsageService(
    private val jdbcTemplate: JdbcTemplate,
    private val objectMapper: ObjectMapper,
) {

    private val log = logger()

    private val sqlFreeEntriesWithCounts = """
        SELECT
            matches #>> '{}' AS value,
            COUNT(DISTINCT d.uuid)::int AS count,
            ARRAY_AGG(DISTINCT d.uuid) AS uuids
        FROM document d
        JOIN document_wrapper dw ON d.uuid = dw.uuid AND d.catalog_id = dw.catalog_id
        JOIN catalog c ON dw.catalog_id = c.id
        , LATERAL jsonb_path_query(
            d.data,
            '$.** ? (@.key == null && @."_codelistId" == ${'$'}cid).value',
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
                val sqlArray = rs.getArray("uuids")
                val uuids: List<String> = when (val arr = sqlArray?.array) {
                    is Array<*> -> arr.filterNotNull().map { it.toString() }
                    else -> emptyList()
                }
                FreeEntryUsage(
                    rs.getString("value"),
                    rs.getInt("count"),
                    uuids,
                )
            }, vars, catalogIdentifier)
        } catch (e: Exception) {
            log.error(
                "Error fetching free entry counts for codelist $codelistId in catalog $catalogIdentifier: ${e.message}",
            )
            emptyList()
        }
    }

    private val sqlSelectDocsForReplacement = """
        SELECT d.id, d.uuid, d.data
        FROM document d
        JOIN document_wrapper dw ON d.uuid = dw.uuid AND d.catalog_id = dw.catalog_id
        JOIN catalog c ON dw.catalog_id = c.id
        WHERE jsonb_path_exists(
            d.data,
            '$.** ? (@.key == null && @."_codelistId" == ${'$'}cid && @.value == ${'$'}val)',
            CAST(? AS jsonb)
        )
          AND c.identifier = ?
          AND dw.deleted = 0
          AND d.state != 'ARCHIVED'
        ORDER BY d.id
    """.trimIndent()

    private val updateSql = """
        UPDATE document
        SET data = ?::jsonb
        WHERE id = ?
    """.trimIndent()

    fun replaceFreeEntryWithKeyed(
        catalogId: String,
        codelistId: String,
        fromValue: String,
        toKey: String,
        toValue: String,
    ): ReplaceFreeEntryResult {
        val vars = """{"cid":"$codelistId","val":${objectMapper.writeValueAsString(fromValue)}}"""

        val idsAndData = jdbcTemplate.query(sqlSelectDocsForReplacement, { rs, _ ->
            Triple(rs.getInt("id"), rs.getString("uuid"), rs.getString("data"))
        }, vars, catalogId)

        var totalReplacements = 0
        val updatedUuids = LinkedHashSet<String>()
        var updatedDocs = 0

        idsAndData.forEach { (id, uuid, dataStr) ->
            val root = objectMapper.readTree(dataStr) as? ObjectNode ?: return@forEach
            val countBefore = totalReplacements
            val replaced = replaceInNode(root, codelistId, fromValue, toKey, toValue)
            if (replaced > 0) {
                totalReplacements += replaced
                jdbcTemplate.update(updateSql, root.toString(), id)
                updatedUuids.add(uuid)
                updatedDocs += 1
            }
        }

        return ReplaceFreeEntryResult(
            occurrences = totalReplacements,
            documentsUpdated = updatedDocs,
            uuids = updatedUuids.toList(),
        )
    }

    private fun replaceInNode(
        node: JsonNode,
        codelistId: String,
        fromValue: String,
        toKey: String,
        toValue: String,
    ): Int {
        var count = 0

        if (node is ObjectNode) {
            // Check if this node is a codelist entry with matching conditions
            val clId = node.get("_codelistId")?.asText()
            val keyNode = node.get("key")
            val valueNode = node.get("value")
            val keyIsNullOrMissing = keyNode == null || keyNode is NullNode
            val valueMatches = valueNode != null && valueNode.isTextual && valueNode.asText() == fromValue
            if (clId == codelistId && keyIsNullOrMissing && valueMatches) {
                node.put("key", toKey)
                node.put("value", toValue)
                count += 1
            }

            // Recurse into object fields
            val fields = node.fields()
            while (fields.hasNext()) {
                val entry = fields.next()
                count += replaceInNode(entry.value, codelistId, fromValue, toKey, toValue)
            }
        } else if (node is ArrayNode) {
            for (elem in node) {
                count += replaceInNode(elem, codelistId, fromValue, toKey, toValue)
            }
        }

        return count
    }
}
