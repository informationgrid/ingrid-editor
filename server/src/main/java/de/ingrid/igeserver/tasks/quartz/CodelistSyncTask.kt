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
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.*

data class FieldToCodelist(
    val arrayField: String? = null,
    val subField: String?,
    val codelist: String,
)

@Component
@PersistJobDataAfterExecution
class CodelistSyncTask(
    private val jdbcTemplate: JdbcTemplate,
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

        val fields = listOf(
            FieldToCodelist("advProductGroups", null, "8010"),
            FieldToCodelist("spatial.spatialSystems", null, "100"),
//          FieldToCodelistld("gridSpatialRepresentation.type", ""),
            FieldToCodelist("distribution.format", "name", "1320"),
            FieldToCodelist(null, "fileReferences.format", "1320"),
            FieldToCodelist("themes", null, "6100"),
            FieldToCodelist("openDataCategories", null, "6400"),
            FieldToCodelist("hvdCategories", null, "hvdCategories"),
            FieldToCodelist("priorityDatasets", null, "6350"),
            FieldToCodelist(null, "spatialScope", "6360"),
            FieldToCodelist("topicCategories", null, "527"),
            FieldToCodelist(null, "spatial.verticalExtent.unitOfMeasure", "102"),
            FieldToCodelist(null, "spatial.verticalExtent.Datum", "101"),
            FieldToCodelist("temporal.events", "referenceDateType", "502"),
            FieldToCodelist(null, "temporal.status", "523"),
            FieldToCodelist(null, "maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
            FieldToCodelist(null, "maintenanceInformation.userDefinedMaintenanceFrequency.unit", "1230"),
            FieldToCodelist(null, "metadata.language", "99999999"),
            FieldToCodelist("dataset.languages", null, "99999999"),
            FieldToCodelist(null, "metadata.characterSet", "510"),
            FieldToCodelist("conformanceResult", "pass", "6000"),
            FieldToCodelist("conformanceResult", "specification", "6005"),
            FieldToCodelist("extraInfo.legalBasicsDescriptions", null, "1350"),
            FieldToCodelist("resource.accessConstraints", null, "6010"),
            FieldToCodelist("resource.useConstraints", "title", "6500"),
            FieldToCodelist("digitalTransferOptions", "name", "520"),
            FieldToCodelist(null, "generalResourceType", "3390"),
            FieldToCodelist(null, "resourceType", "3386"),
            FieldToCodelist("references", "type", "2000"),
            FieldToCodelist("references", "urlDataType", "1320"),
            FieldToCodelist("pointOfContact", "type", "505"),
            FieldToCodelist(null, "service.type", "5100"),
            FieldToCodelist("service.classification", null, "5200"),
            FieldToCodelist("service.version", null, "5152"), // dynamic!!!
            FieldToCodelist("service.operations", "name", "5110"), // dynamic!!!
        )
        fields.forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = getSQL(it, catalogIdentifier, catalogLanguage)
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

    private fun getSQL(codelistField: FieldToCodelist, catalogIdentifier: String, language: String): String {
        val rootField = codelistField.arrayField ?: codelistField.subField!!
        val jsonPath = rootField.split(".").joinToString(" -> ") { "'$it'" }
        val jsonPath2 = rootField.replace(".", ",")
        val nullFilter = rootField
        val subPathForArrays = codelistField.subField?.replace(".", ",")?.let { "$it," } ?: ""
        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{$jsonPath2}',
                        CASE
                            WHEN jsonb_typeof(d.data -> $jsonPath) = 'array' THEN
                                COALESCE(
                                    (
                                        SELECT jsonb_agg(
                                            jsonb_set(elem, '{${subPathForArrays}_codelistId}', '"${codelistField.codelist}"', TRUE)
                                        )
                                        FROM jsonb_array_elements(d.data -> $jsonPath) elem
                                    ),
                                    '[]'::jsonb
                                )
                            WHEN jsonb_typeof(d.data -> $jsonPath) = 'object' THEN
                                jsonb_set(d.data -> $jsonPath, '{_codelistId}', '"${codelistField.codelist}"', TRUE)
                            END,
                        FALSE
                           )
                FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
                WHERE d.uuid = dw.uuid
                  AND cat.identifier = '$catalogIdentifier'
                  AND dw.deleted = 0
                  AND d.state != 'ARCHIVED'
                  AND d.data ${convertToJsonPathForNullCheck(rootField)} IS NOT NULL
        """.trimIndent()
    }

    private fun convertToJsonPathForNullCheck(dotPath: String): String {
        val parts = dotPath.split(".")

        return parts.mapIndexed { index, part ->
            when {
                // Letztes Element mit ->>
                index == parts.size - 1 -> " ->> '$part'"
                // Mittlere Elemente mit ->
                else -> " -> '$part'"
            }
        }.joinToString("")
    }
}
