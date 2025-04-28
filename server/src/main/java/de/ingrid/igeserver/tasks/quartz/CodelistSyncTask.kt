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
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.*

data class FieldToCodelist(
    val field: String,
    val codelist: String,
    val isArray: Boolean = false,
)

@Component
@PersistJobDataAfterExecution
class CodelistSyncTask(
    private val jdbcTemplate: JdbcTemplate,
    private val codelistHandler: CodelistHandler,
) : IgeJob() {

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Codelist Synchronization")

        val message = Message(Date(), 0)
        message.message = "Starting codelist synchronization"

        val codelistFields = listOf(
            FieldToCodelist("advProductGroups", "8010", true),
            FieldToCodelist("spatial.spatialSystems", "100", true),
//            FieldToCodelist("gridSpatialRepresentation.type", ""),
            FieldToCodelist("distribution.format.name", "1320"),
            FieldToCodelist("references.urlDataType", "1320"),
            FieldToCodelist("fileReferences.format", "1320"),
            FieldToCodelist("advProductGroups", "8010", true),
            FieldToCodelist("themes", "6100", true),
            FieldToCodelist("openDataCategories", "6400", true),
            FieldToCodelist("hvdCategories", "hvdCategories", true),
            FieldToCodelist("priorityDatasets", "6350", true),
            FieldToCodelist("spatialScope", "6360"),
            FieldToCodelist("topicCategories", "527", true),
            FieldToCodelist("spatial.spatialSystems", "100", true),
            FieldToCodelist("spatial.verticalExtent.unitOfMeasure", "102"),
            FieldToCodelist("spatial.verticalExtent.Datum", "101"),
            FieldToCodelist("temporal.events.referenceDateType", "502"),
            FieldToCodelist("temporal.status", "523"),
            FieldToCodelist("maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
            FieldToCodelist("maintenanceInformation.userDefinedMaintenanceFrequency.duration.unitOfTime", "1230"),
            FieldToCodelist("metadata.language", "99999999"),
            FieldToCodelist("dataset.languages", "99999999", true),
            FieldToCodelist("metadata.characterSet", "510"),
            FieldToCodelist("conformanceResult.pass", "6000"),
//            FieldToCodelist("explanation.supplementalInformation", "1350"),
            FieldToCodelist("resource.accessConstraints", "6010", true),
            FieldToCodelist("resource.useConstraints.title", "6500"),
            FieldToCodelist("digitalTransferOptions.name", "520"),
            FieldToCodelist("generalResourceType", "3390"),
            FieldToCodelist("resourceType", "3386"),
            FieldToCodelist("references.type", "2000"),

            FieldToCodelist("service.type", "5100"),
            FieldToCodelist("service.version", "5152", true), // dynamic!!!
            FieldToCodelist("service.operations", "5110", true), // dynamic!!!
            FieldToCodelist("service.classification", "5200", true),
        )
        val catalogIdentifier = context.mergedJobDataMap!!.getString("catalogId")

        codelistFields.forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = when (it.isArray) {
                    true -> getSQL(it, catalogIdentifier)
                    false -> getSQLForObject(it, catalogIdentifier)
                }
                log.info("Executing SQL: $sql")
                val updatedRows = jdbcTemplate.update(sql)

                message.message = "Codelist synchronization completed successfully. Updated $updatedRows rows."
                log.info("Codelist synchronization completed successfully. Updated $updatedRows rows for ${it.field}.")
            } catch (e: Exception) {
                val errorMessage = "Error during codelist synchronization: ${e.message}"
                message.errors.add(errorMessage)
                log.error(errorMessage, e)
            }
        }
        message.endTime = Date()
        finishJob(context, message)
    }

    private fun getSQL(codelistField: FieldToCodelist, catalogIdentifier: String): String {
        val codelist = codelistHandler.getCodelists(listOf(codelistField.codelist)).firstOrNull() ?: codelistHandler.getCatalogCodelists(catalogIdentifier).find { it.id == codelistField.codelist }
        val generatedWhens = codelist?.entries?.map {
            // TODO: localize!!!
            """WHEN elem ->> 'key' = '${it.id}' THEN jsonb_set(elem, '{value}', '"${it.fields["de"]}"', TRUE)"""
        }
        if (generatedWhens.isNullOrEmpty()) throw IllegalArgumentException("No codelist found for key ${codelistField.codelist}")

        val jsonPath = codelistField.field.split(".").joinToString(" -> ") { "'$it'" }
        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{${codelistField.field.replace(".",",")}}',
                        (
                            SELECT jsonb_agg(
                                           CASE
                                               ${generatedWhens.joinToString("\n")}
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
                  AND jsonb_typeof(d.data -> $jsonPath) = 'array';
        """.trimIndent()
    }

    private fun getSQLForObject(codelistField: FieldToCodelist, catalogIdentifier: String): String {
        val codelist = codelistHandler.getCodelists(listOf(codelistField.codelist)).firstOrNull() ?: codelistHandler.getCatalogCodelists(catalogIdentifier).find { it.id == codelistField.codelist }
        val jsonPath = codelistField.field.split(".").joinToString(" -> ") { "'$it'" }
        val generatedWhens = codelist?.entries?.map {
            // TODO: localize!!!
            """WHEN d.data -> $jsonPath ->> 'key' = '${it.id}' THEN jsonb_set(d.data -> $jsonPath, '{value}', '"${it.fields["de"]}"', TRUE)"""
        }
        if (generatedWhens.isNullOrEmpty()) throw IllegalArgumentException("No codelist found for key ${codelistField.codelist}")

        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{${codelistField.field.replace(".",",")}}',
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
