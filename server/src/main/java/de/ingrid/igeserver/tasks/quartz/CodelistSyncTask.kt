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
package de.ingrid.igeserver.tasks.quartz

import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistField
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.*

data class FieldToCodelist(
    val field: String?,
    val codelist: String,
)

data class ArrayFieldToCodelist(
    val arrayField: String? = null,
    val subField: String?,
    val codelist: String,
)

@Component
@PersistJobDataAfterExecution
class CodelistSyncTask(
    private val jdbcTemplate: JdbcTemplate,
    private val codelistHandler: CodelistHandler,
    private val catalogService: CatalogService,
) : IgeJob() {

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Codelist Synchronization")

        val message = Message(Date(), 0)
        message.message = "Starting codelist synchronization"
        val catalogIdentifier = context.mergedJobDataMap!!.getString("catalogId")
        val catalog = catalogService.getCatalogById(catalogIdentifier)
        val catalogLanguage = catalog.settings.config.language ?: "de"
        val profile = catalogService.getCatalogProfile(catalog.type)

        profile.codelistFields.forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = when (it) {
                    is CodelistField.ListField -> getSQL(it, catalogIdentifier, catalogLanguage)
                    is CodelistField.SingleField -> getSQLForObject(it, catalogIdentifier, catalogLanguage)
                }
                log.info("Executing SQL: $sql")
                val updatedRows = jdbcTemplate.update(sql)

                message.message = "Codelist synchronization completed successfully. Updated $updatedRows rows."
                log.info("Codelist synchronization completed successfully. Updated $updatedRows rows for $it.")
            } catch (e: Exception) {
                val errorMessage = "Error during codelist synchronization: ${e.message}"
                message.errors.add(errorMessage)
                log.error(errorMessage, e)
            }
        }
        message.endTime = Date()
        finishJob(context, message)
    }

    private fun getSQL(codelistField: CodelistField.ListField, catalogIdentifier: String, language: String): String {
        val codelist = codelistHandler.getCodelists(listOf(codelistField.codelist)).firstOrNull()
            ?: codelistHandler.getCatalogCodelists(catalogIdentifier).find { it.id == codelistField.codelist }
        val fieldPath = if (codelistField.subField != null) {
            "-> " + codelistField.subField.split(".")
                .joinToString(" -> ") { "'$it'" }
        } else {
            ""
        }
        val generatedWhens = codelist?.entries?.map {
            """WHEN elem $fieldPath ->> 'key' = '${it.id}' THEN '${it.fields[language]}'"""
        }
        if (generatedWhens.isNullOrEmpty()) throw IllegalArgumentException("No codelist found for key ${codelistField.codelist}")

        val arrayField = codelistField.arrayField!!
        val jsonPath = arrayField.split(".").joinToString(" -> ") { "'$it'" }
        val jsonPath2 = arrayField.replace(".", ",")
        val valueField = codelistField.subField?.replace(".", ",")?.let { "$it,value" } ?: "value"
        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{$jsonPath2}',
                        (
                            SELECT jsonb_agg(
                                           CASE
                                               WHEN elem $fieldPath ? 'key' THEN
                                                   jsonb_set(
                                                           elem,
                                                           '{$valueField}',
                                                           to_jsonb(
                                                                   CASE
                                                                       ${generatedWhens.joinToString("\n")}
                                                                       ELSE NULL
                                                                       END
                                                           ),
                                                           TRUE
                                                   )
                                               ELSE elem
                                           END
                                   )
                            FROM jsonb_array_elements(d.data -> $jsonPath) elem
                        ),
                        TRUE
                           )
                FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
                WHERE d.uuid = dw.uuid
                  AND cat.identifier = '$catalogIdentifier'
                  AND dw.deleted = 0
                  AND d.state != 'ARCHIVED'
                  AND jsonb_typeof(d.data -> $jsonPath) = 'array'
        """.trimIndent()
    }

    private fun getSQLForObject(codelistField: CodelistField.SingleField, catalogIdentifier: String, language: String): String {
        val codelist = codelistHandler.getCodelists(listOf(codelistField.codelist)).firstOrNull()
            ?: codelistHandler.getCatalogCodelists(catalogIdentifier).find { it.id == codelistField.codelist }
        val jsonPath = codelistField.field!!.split(".").joinToString(" -> ") { "'$it'" }
        val generatedWhens = codelist?.entries?.map {
            """WHEN d.data -> $jsonPath ->> 'key' = '${it.id}' THEN jsonb_set(d.data -> $jsonPath, '{value}', '"${it.fields[language]}"', TRUE)"""
        }
        if (generatedWhens.isNullOrEmpty()) throw IllegalArgumentException("No codelist found for key ${codelistField.codelist}")

        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{${codelistField.field.replace(".", ",")}}',
                        CASE
                            ${generatedWhens.joinToString("\n")}
                            ELSE d.data -> $jsonPath
                        END,
                        TRUE
                           )
                FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
                WHERE d.uuid = dw.uuid
                  AND cat.identifier = 'test_catalog'
                  AND dw.deleted = 0
                  AND d.state != 'ARCHIVED'
                  AND jsonb_typeof(d.data -> $jsonPath) = 'object';
        """.trimIndent()
    }
}
