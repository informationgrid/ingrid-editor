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
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.profiles.uvp.exporter.model.DataModel.Companion.behaviourService
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.JobKey
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.*

data class FieldToCodelist(
    val arrayField: String? = null,
    val subField: String?,
    val codelist: String,
)

@Component
class MigrateCodelistIdsIntoDatasets(
    private val jdbcTemplate: JdbcTemplate,
    private val catalogService: CatalogService,
    private val behaviourService: BehaviourService,
    private val scheduler: SchedulerService,
) : IgeJob() {

    override val log = logger()

    companion object {
        const val JOB_KEY: String = "migrateCodelistIdsIntoDatasets"
    }

    private final val fieldsAddress = listOf(
        FieldToCodelist(null, "salutation", "4300"),
        FieldToCodelist(null, "academic-title", "4305"),
        FieldToCodelist("contact", "type", "4430"),
        FieldToCodelist(null, "address.country", "6200"),
        FieldToCodelist(null, "address.administrativeArea", "6250"),
    )

    private final val fieldsInGrid = fieldsAddress + listOf(
        FieldToCodelist("advProductGroups", null, "8010"),
        FieldToCodelist("spatial.spatialSystems", null, "100"),
//          FieldToCodelistld("gridSpatialRepresentation.type", ""), -> IS NULL
        FieldToCodelist("distribution.format", "name", "1320"),
        FieldToCodelist("fileReferences", "format", "1320"),
        FieldToCodelist("themes", null, "6100"),
        FieldToCodelist("openDataCategories", null, "6400"),
        FieldToCodelist("hvdCategories", null, "hvdCategories"),
        FieldToCodelist("priorityDatasets", null, "6350"),
        FieldToCodelist(null, "spatialScope", "6360"),
        FieldToCodelist("topicCategories", null, "527"),
        FieldToCodelist(null, "spatial.verticalExtent.unitOfMeasure", "102"),
        FieldToCodelist(null, "spatial.verticalExtent.Datum", "101"),
        FieldToCodelist("temporal.events", "referenceDateType", "502"),
        FieldToCodelist("dataQualityInfo.lineage.source.descriptions", "dateType", "502"),
        FieldToCodelist(null, "temporal.status", "523"),
        FieldToCodelist(null, "maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
        FieldToCodelist(null, "maintenanceInformation.userDefinedMaintenanceFrequency.unit", "1230"),
        FieldToCodelist(null, "metadata.language", "99999999"),
//        FieldToCodelist("dataset.languages", null, "99999999"), // only stored as simple values
        FieldToCodelist(null, "metadata.characterSet", "510"),
        FieldToCodelist("conformanceResult", "pass", "6000"),
        FieldToCodelist("conformanceResult", "specification", "6005"),
        FieldToCodelist("extraInfo.legalBasicsDescriptions", null, "1350"),
        FieldToCodelist("resource.accessConstraints", null, "6010"),
        FieldToCodelist("resource.useConstraints", "title", "6500"),
        FieldToCodelist("digitalTransferOptions", "name", "520"),
//        FieldToCodelist("digitalTransferOptions", "transferSize", null),
        FieldToCodelist(null, "publication.generalResourceType", "3390"),
        FieldToCodelist(null, "publication.resourceType", "3386"),
        FieldToCodelist("references", "type", "2000"),
        FieldToCodelist("references", "urlDataType", "1320"),
        FieldToCodelist("pointOfContact", "type", "505"),
        FieldToCodelist(null, "service.type", "5100"),
        FieldToCodelist("service.classification", null, "5200"),
//        FieldToCodelist("service.version", null, "5152"), // dynamic -> special handling
//        FieldToCodelist("service.operations", "name", "5110"), // dynamic -> special handling

        FieldToCodelist("featureCatalogueDescription.citation", "title", "3535"),
        FieldToCodelist("portrayalCatalogueInfo.citation", "title", "3555"),
        FieldToCodelist(null, "properties.subType", "525"),
        FieldToCodelist("spatialRepresentationType", null, "526"),
        FieldToCodelist(null, "vectorSpatialRepresentation.topologyLevel", "528"),
        FieldToCodelist(null, "vectorSpatialRepresentation.geometricObjectType", "515"),
        FieldToCodelist("gridSpatialRepresentation.axesDimensionProperties", "name", "514"),
        FieldToCodelist(null, "gridSpatialRepresentation.cellGeometry", "509"),
        FieldToCodelist(null, "gridSpatialRepresentation.georectified.pointInPixel", "2100"),
//        FieldToCodelist("qualities", "measureType", "7127"), // dynamic!!!
        FieldToCodelist(null, "serviceType", "5300"),
        FieldToCodelist(null, "publication.documentType", "3385"),
    )

    val fieldsUvp = fieldsAddress + listOf(
//        FieldToCodelist("eiaNumbers", null, "9000"), // dynamic!!!
    )
    val fieldsOpendata = fieldsAddress + listOf(
        FieldToCodelist(null, "country", "6200"),
        FieldToCodelist("contact", "type", "4430"),
        FieldToCodelist(null, "openDataCategories", "6400"),
        FieldToCodelist("addresses", "type", "505"),
        FieldToCodelist("hvdCategories", null, "hvdCategories"),
        FieldToCodelist("distributions", "format", "20003"),
//        FieldToCodelist("distributions", "languages", "20007"), // array in array not supported => ignore
        FieldToCodelist("distributions", "license", "20004"),
        FieldToCodelist("distributions", "availability", "20005"),
        FieldToCodelist(null, "politicalGeocodingLevel", "20006"),
        FieldToCodelist(null, "periodicity", "518"),
    )
    val fieldsTest = fieldsAddress + listOf(
        FieldToCodelist(null, "select", "8000"),
        FieldToCodelist(null, "autocomplete", "6500"),
        FieldToCodelist(null, "multiChips", "100"),
        FieldToCodelist("table", "type", "20002"),
        FieldToCodelist("repeatListCodelist", null, "100"),
    )
    val fieldsHmdk = fieldsAddress + fieldsInGrid + listOf(
        FieldToCodelist("informationHmbTG", null, "informationsgegenstand"),
    )
    val fieldsKrzn = fieldsAddress + fieldsInGrid + listOf(
        FieldToCodelist(null, "mapLink", "10500"),
    )

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: MigrateCodelistIdsIntoDatasets")

        val message = Message(Date(), 0)
        message.message =
            "Starting codelist id migration for catalog: ${context.mergedJobDataMap?.getString("catalogId")}..."
        val catalogIdentifier = context.mergedJobDataMap!!.getString("catalogId")
        val catalog = catalogService.getCatalogById(catalogIdentifier)
        val profile = catalogService.getCatalogProfile(catalog.type)
        log.info("Profile: $profile for catalog: $catalogIdentifier")

        getFields(profile).forEach {
            try {
                // Execute the SQL query to update codelist values
                val sql = getSQL(it, catalogIdentifier)
//                log.debug("Executing SQL: $sql")
                val updatedRows = jdbcTemplate.update(sql)

                message.message = "Codelist synchronization completed successfully. Updated $updatedRows rows."
                log.debug("Codelist synchronization completed successfully. Updated $updatedRows rows for $it.")
            } catch (e: Exception) {
                val errorMessage = "Error during codelist synchronization: ${e.message}"
                message.errors.add(errorMessage)
                log.error(errorMessage, e)
            }
        }

        if (profile.identifier == "ingrid" || profile.parentProfile == "ingrid") {
            getSQLForDynamicOperationsCodelistId(catalogIdentifier).let { operationSql ->
                log.debug("Executing SQL for dynamic operations")
                jdbcTemplate.update(operationSql)
            }

            getSQLForDynamicVersionsCodelistId(catalogIdentifier).let { operationSql ->
                log.debug("Executing SQL for dynamic version")
                jdbcTemplate.update(operationSql)
            }

            getSQLForDynamicQualitiesCodelistId(catalogIdentifier).let { operationSql ->
                log.debug("Executing SQL for dynamic qualities")
                jdbcTemplate.update(operationSql)
            }
        } else if (profile.identifier == "uvp") {
            // get uvp number list of catalog
            val uvpCodelistId = behaviourService.get(catalogIdentifier, "plugin.uvp.eia-number")?.data?.get("uvpCodelist")?.toString() ?: "9000"
            FieldToCodelist("eiaNumbers", null, uvpCodelistId).let {
                val sql = getSQL(it, catalogIdentifier)
                log.debug("Executing SQL: $sql")
                val updatedRows = jdbcTemplate.update(sql)
            }
        }

        // now trigger another job to add the codelist values to the datasets
        val jobKey = JobKey.jobKey(CodelistSyncTask.JOB_KEY, catalogIdentifier)
        val jobDataMap = JobDataMap().apply {
            this.put("catalogId", catalogIdentifier)
        }
        scheduler.handleJobWithCommand(JobCommand.start, CodelistSyncTask::class.java, jobKey, jobDataMap)

        message.endTime = Date()
        finishJob(context, message)
    }

    private fun getFields(profile: CatalogProfile): List<FieldToCodelist> = when (profile.identifier) {
        "ingrid" -> fieldsInGrid
        "ingrid-krzn" -> fieldsKrzn
        "ingrid-hmdk" -> fieldsHmdk
        "uvp" -> fieldsUvp
        "opendata" -> fieldsOpendata
        "test" -> fieldsTest
        else -> when (profile.parentProfile) {
            "ingrid" -> fieldsInGrid
            "uvp" -> fieldsUvp
            "opendata" -> fieldsOpendata
            "test" -> fieldsTest
            else -> emptyList()
        }
    }

    private fun getSQL(codelistField: FieldToCodelist, catalogIdentifier: String): String {
        val rootField = codelistField.arrayField ?: codelistField.subField!!
        val jsonPath = rootField.split(".").joinToString(" -> ") { "'$it'" }
        val pathCommaSeparated = rootField.replace(".", ",")
        val subPathForArrays = codelistField.subField?.replace(".", ",")?.let { "$it," } ?: ""
        return """
                UPDATE document d
                SET data = jsonb_set(
                        d.data,
                        '{$pathCommaSeparated}',
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

    private fun getSQLForDynamicOperationsCodelistId(catalogIdentifier: String): String = """
            UPDATE document d
            SET data = jsonb_set(
                d.data,
                '{service,operations}',
                COALESCE(
                    (
                        SELECT jsonb_agg(
                                    CASE
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '1' THEN jsonb_set(elem, '{name,_codelistId}', '"5105"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '2' THEN jsonb_set(elem, '{name,_codelistId}', '"5110"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '3' THEN jsonb_set(elem, '{name,_codelistId}', '"5120"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '4' THEN jsonb_set(elem, '{name,_codelistId}', '"5130"', TRUE)
                                    ELSE jsonb_set(elem, '{name,_codelistId}', '"5110"', TRUE)
                                    END
                                )
                        FROM jsonb_array_elements(d.data -> 'service' -> 'operations') elem
                    ),
                    '[]'::jsonb
                )
            )
            FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
            WHERE d.uuid = dw.uuid
              AND cat.identifier = '$catalogIdentifier'
              AND dw.deleted = 0
              AND d.state != 'ARCHIVED'
              AND d.data -> 'service' ->> 'operations' IS NOT NULL
    """.trimIndent()

    private fun getSQLForDynamicVersionsCodelistId(catalogIdentifier: String): String = """
            UPDATE document d
            SET data = jsonb_set(
                d.data,
                '{service,version}',
                COALESCE(
                    (
                        SELECT jsonb_agg(
                                    CASE
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '1' THEN jsonb_set(elem, '{_codelistId}', '"5151"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '2' THEN jsonb_set(elem, '{_codelistId}', '"5152"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '3' THEN jsonb_set(elem, '{_codelistId}', '"5153"', TRUE)
                                        WHEN d.data -> 'service' -> 'type' ->> 'key' = '4' THEN jsonb_set(elem, '{_codelistId}', '"5154"', TRUE)
                                    ELSE jsonb_set(elem, '{_codelistId}', '"5151"', TRUE)
                                    END
                                )
                        FROM jsonb_array_elements(d.data -> 'service' -> 'version') elem
                    ),
                    '[]'::jsonb
                )
            )
            FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
            WHERE d.uuid = dw.uuid
              AND cat.identifier = '$catalogIdentifier'
              AND dw.deleted = 0
              AND d.state != 'ARCHIVED'
              AND d.data -> 'service' ->> 'version' IS NOT NULL
    """.trimIndent()

    private fun getSQLForDynamicQualitiesCodelistId(catalogIdentifier: String): String = """
            UPDATE document d
            SET data = jsonb_set(
                d.data,
                '{qualities}',
                COALESCE(
                    (
                        SELECT jsonb_agg(
                                    CASE
                                        WHEN elem ->> '_type' = 'completenessComission' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7109"', TRUE)
                                        WHEN elem ->> '_type' = 'conceptualConsistency' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7112"', TRUE)
                                        WHEN elem ->> '_type' = 'domainConsistency' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7113"', TRUE)
                                        WHEN elem ->> '_type' = 'formatConsistency' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7114"', TRUE)
                                        WHEN elem ->> '_type' = 'topologicalConsistency' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7115"', TRUE)
                                        WHEN elem ->> '_type' = 'temporalConsistency' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7120"', TRUE)
                                        WHEN elem ->> '_type' = 'thematicClassificationCorrectness' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7125"', TRUE)
                                        WHEN elem ->> '_type' = 'nonQuantitativeAttributeAccuracy' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7126"', TRUE)
                                        WHEN elem ->> '_type' = 'quantitativeAttributeAccuracy' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7127"', TRUE)
                                        WHEN elem ->> '_type' = 'relativeInternalPositionalAccuracy' THEN jsonb_set(elem, '{measureType,_codelistId}', '"7128"', TRUE)
                                    ELSE jsonb_set(elem, '{measureType,_codelistId}', '"7109"', TRUE)
                                    END
                                )
                        FROM jsonb_array_elements(d.data -> 'qualities') elem
                    ),
                    '[]'::jsonb
                )
            )
            FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id
            WHERE d.uuid = dw.uuid
              AND cat.identifier = '$catalogIdentifier'
              AND dw.deleted = 0
              AND d.state != 'ARCHIVED'
              AND d.data ->> 'qualities' IS NOT NULL
    """.trimIndent()

    private fun convertToJsonPathForNullCheck(dotPath: String): String {
        val parts = dotPath.split(".")

        return parts.mapIndexed { index, part ->
            when {
                // last element with ->>
                index == parts.size - 1 -> " ->> '$part'"
                else -> " -> '$part'"
            }
        }.joinToString("")
    }
}
