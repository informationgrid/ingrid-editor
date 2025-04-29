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
    val isArray: Boolean = false,
    val arrayField: String? = null,
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
        val catalogLanguage = catalogService.getCatalogById(catalogIdentifier).settings.config.language ?: "de"

        val codelistFields = listOf(
            ArrayFieldToCodelist("advProductGroups", null, "8010"),
            ArrayFieldToCodelist("spatial.spatialSystems", null, "100"),
//            FieldToCodelist("gridSpatialRepresentation.type", ""),
            ArrayFieldToCodelist("distribution.format", "name", "1320"),
            FieldToCodelist("fileReferences.format", "1320"),
            ArrayFieldToCodelist("themes", null, "6100"),
            ArrayFieldToCodelist("openDataCategories", null, "6400"),
            ArrayFieldToCodelist("hvdCategories", null, "hvdCategories"),
            ArrayFieldToCodelist("priorityDatasets", null, "6350"),
            FieldToCodelist("spatialScope", "6360"),
            ArrayFieldToCodelist("topicCategories", null, "527"),
            FieldToCodelist("spatial.verticalExtent.unitOfMeasure", "102"),
            FieldToCodelist("spatial.verticalExtent.Datum", "101"),
            ArrayFieldToCodelist("temporal.events", "referenceDateType", "502"),
            FieldToCodelist("temporal.status", "523"),
            FieldToCodelist("maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
            FieldToCodelist("maintenanceInformation.userDefinedMaintenanceFrequency.unit", "1230"),
            FieldToCodelist("metadata.language", "99999999"),
            ArrayFieldToCodelist("dataset.languages", null, "99999999"),
            FieldToCodelist("metadata.characterSet", "510"),
            ArrayFieldToCodelist("conformanceResult", "pass", "6000"),
            ArrayFieldToCodelist("conformanceResult", "specification", "6005"),
//            FieldToCodelist("explanation.supplementalInformation", "1350"),
            ArrayFieldToCodelist("resource.accessConstraints", null, "6010"),
            ArrayFieldToCodelist("resource.useConstraints", "title", "6500"),
            ArrayFieldToCodelist("digitalTransferOptions", "name", "520"),
            FieldToCodelist("generalResourceType", "3390"),
            FieldToCodelist("resourceType", "3386"),
            ArrayFieldToCodelist("references", "type", "2000"),
            ArrayFieldToCodelist("references", "urlDataType", "1320"),
            ArrayFieldToCodelist("pointOfContact", "type", "505"),

            FieldToCodelist("service.type", "5100"),
            ArrayFieldToCodelist("service.classification", null, "5200"),
            ArrayFieldToCodelist("service.version", null, "5152"), // dynamic!!!
            ArrayFieldToCodelist("service.operations", "name", "5110"), // dynamic!!!
        )

        codelistFields.forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = when (it is ArrayFieldToCodelist) {
                    true -> getSQL(it, catalogIdentifier, catalogLanguage)
                    false -> getSQLForObject(it as FieldToCodelist, catalogIdentifier, catalogLanguage)
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

    private fun getSQL(codelistField: ArrayFieldToCodelist, catalogIdentifier: String, language: String): String {
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

    private fun getSQLForObject(codelistField: FieldToCodelist, catalogIdentifier: String, language: String): String {
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
