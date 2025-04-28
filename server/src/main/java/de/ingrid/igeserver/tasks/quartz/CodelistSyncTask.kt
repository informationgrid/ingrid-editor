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
            Pair("advProductGroups", "8010"),
            Pair("spatial.spatialSystems", "100"),
            Pair("gridSpatialRepresentation.type", ""),
            Pair("distribution.format.name", "1320"),
            Pair("references.urlDataType", "1320"),
            Pair("fileReferences.format", "1320"),
            Pair("advProductGroups", "8010"),
            Pair("themes", "6100"),
            Pair("openDataCategories", "6400"),
            Pair("hvdCategories", "hvdCategories"),
            Pair("priorityDatasets", "6350"),
            Pair("spatialScope", "6360"),
            Pair("topicCategories", "527"),
            Pair("spatial.spatialSystems", "100"),
            Pair("spatial.verticalExtent.unitOfMeasure", "102"),
            Pair("spatial.verticalExtent.Datum", "101"),
            Pair("temporal.events.referenceDateType", "502"),
            Pair("temporal.status", "523"),
            Pair("maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
            Pair("maintenanceInformation.userDefinedMaintenanceFrequency.duration.unitOfTime", "1230"),
            Pair("metadata.language", "99999999"),
            Pair("dataset.languages", "99999999"),
            Pair("metadata.characterSet", "510"),
            Pair("conformanceResult.pass", "6000"),
            Pair("explanation.supplementalInformation", "1350"),
            Pair("resource.accessConstraints", "6010"),
            Pair("resource.useConstraints.title", "6500"),
            Pair("digitalTransferOptions.name", "520"),
            Pair("generalResourceType", "3390"),
            Pair("resourceType", "3386"),
            Pair("references.type", "2000"),
        )
        val catalogIdentifer = context.mergedJobDataMap!!.getString("catalogId")

        codelistFields.forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = getSQL(it, catalogIdentifer)
                log.info("Executing SQL: $sql")
                val updatedRows = jdbcTemplate.update(sql)

                message.message = "Codelist synchronization completed successfully. Updated $updatedRows rows."
                log.info("Codelist synchronization completed successfully. Updated $updatedRows rows.")
            } catch (e: Exception) {
                val errorMessage = "Error during codelist synchronization: ${e.message}"
                message.errors.add(errorMessage)
                log.error(errorMessage, e)
            }
        }
        message.endTime = Date()
        finishJob(context, message)
    }

    private fun getSQL(codelistField: Pair<String, String>, catalogIdentifier: String): String {
        val generatedWhens = codelistHandler.getCodelists(listOf(codelistField.second)).first().entries.map {
            // TODO: localize!!!
            """WHEN elem ->> 'key' = '${it.id}' THEN jsonb_set(elem, '{value}', '"${it.fields["de"]}"', TRUE)"""
        }

        val jsonPath = codelistField.first.split(".").joinToString(" -> ") { "'$it'" }
        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{${codelistField.first}}',
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
}
