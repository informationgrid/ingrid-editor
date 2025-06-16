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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getString
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
    private val catalogService: CatalogService,
    private val objectMapper: ObjectMapper,
    private val codelistHandler: CodelistHandler,
) : IgeJob() {

    override val log = logger()

    // TODO: use paging
    private val sqlNonArchivedDocuments = """
        SELECT d.uuid, d.data 
        FROM document d
        JOIN document_wrapper dw ON d.uuid = dw.uuid
        JOIN catalog c ON dw.catalog_id = c.id
        WHERE c.identifier = ?
        AND dw.deleted = 0
        AND d.state != 'ARCHIVED'
    """.trimIndent()

    private val updateSql = """
        UPDATE document
        SET data = ?::jsonb
        WHERE uuid = ?
    """.trimIndent()

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Codelist Synchronization")

        val message = Message(Date(), 0)
        message.message = "Starting codelist synchronization"
        val catalogIdentifier = context.mergedJobDataMap!!.getString("catalogId")
        val catalog = catalogService.getCatalogById(catalogIdentifier)
        val catalogLanguage = catalog.settings.config.language ?: "de"

        try {
            val documentCount = jdbcTemplate.query(sqlNonArchivedDocuments, { rs, _ ->
                val uuid = rs.getString("uuid")
                val dataJson = rs.getString("data")
                val dataNode = objectMapper.readTree(dataJson)
                var modified = false

                val jsonPaths = findJsonPathsWithCodelistIdField(dataNode, "$") { path, node, fieldName ->
                    try {
                        updateCodelistEntry(node, path, uuid, catalogIdentifier, catalogLanguage).let {
                            if (it) modified = true
                        }
                    } catch (e: Exception) {
                        log.error(e.message ?: "Error updating codelist entry at path: $path for uuid: $uuid")
                    }
                }

                // If the node was modified, update it in the database
                if (modified) {
                    val updatedJson = objectMapper.writeValueAsString(dataNode)
                    log.info("Updating document with UUID: $uuid")
                    log.debug("Modified JSON: $updatedJson")

                    jdbcTemplate.update(updateSql, updatedJson, uuid)
                }

                // Log the results from the original behavior
                if (jsonPaths.isNotEmpty()) {
                    log.info("Found ${jsonPaths.size} paths with key field in document: $jsonPaths")
                }

                1 // Return 1 for each document processed
            }, catalogIdentifier).sum()

            message.message = "Codelist synchronization completed successfully. Processed $documentCount documents."
            log.info(message.message)
        } catch (e: Exception) {
            val errorMessage = "Error during codelist synchronization: ${e.message}"
            message.errors.add(errorMessage)
            log.error(errorMessage, e)
        }

        message.endTime = Date()
        finishJob(context, message)
    }

    private fun updateCodelistEntry(
        node: JsonNode,
        path: String,
        uuid: String?,
        catalogIdentifier: String,
        catalogLanguage: String,
    ): Boolean {
        val codelistId = node.getString("_codelistId")
            ?: throw ServerException.withReason("Key field is null at path: $path for uuid: $uuid")
        val entryKey = node.getString("key")
        val codelist = codelistHandler.getCodelists(listOf(codelistId)).firstOrNull()
            ?: codelistHandler.getCatalogCodelists(catalogIdentifier).find { it.id == codelistId }
            ?: throw ServerException.withReason("Codelist not found for id: $codelistId at path: $path for uuid: $uuid")

        if (entryKey == null) {
            // TODO: check if value is now a codelist-entry
        } else {
            val codelistEntryValue = codelist.entries?.find { it.id == entryKey }?.getField(catalogLanguage)
            if (codelistEntryValue == null) {
                log.warn("Codelist entry not be found for id: $entryKey at path: $path for uuid: $uuid")
                // TODO: convert to free entry
                (node as ObjectNode).put("key", null as String?)
            } else {
                (node as ObjectNode).put("value", codelistEntryValue)
            }
        }
        return true
    }

    fun findJsonPathsWithCodelistIdField(
        node: JsonNode,
        currentPath: String,
        onKeyFieldFound: ((path: String, node: JsonNode, fieldName: String) -> Unit)? = null,
    ): List<String> {
        val result = mutableListOf<String>()

        if (node.isObject) {
            node.fields().forEach { (fieldName, value) ->
                val newPath = if (currentPath == "$") "$.$fieldName" else "$currentPath.$fieldName"

                if (fieldName == "_codelistId") {
                    if (onKeyFieldFound != null) {
                        onKeyFieldFound(currentPath, node, fieldName)
                    } else {
                        result.add(currentPath)
                    }
                }

                result.addAll(findJsonPathsWithCodelistIdField(value, newPath, onKeyFieldFound))
            }
        } else if (node.isArray) {
            for (i in 0 until node.size()) {
                val newPath = "$currentPath[$i]"
                result.addAll(findJsonPathsWithCodelistIdField(node[i], newPath, onKeyFieldFound))
            }
        }

        return result
    }
}
