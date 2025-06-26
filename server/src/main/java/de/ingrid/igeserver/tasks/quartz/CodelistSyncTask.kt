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
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getString
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.*

@Component
class CodelistSyncTask(
    private val jdbcTemplate: JdbcTemplate,
    private val catalogService: CatalogService,
    private val objectMapper: ObjectMapper,
    private val codelistHandler: CodelistHandler,
    val notifier: JobsNotifier,
) : IgeJob() {

    override val log = logger()

    companion object {
        const val JOB_KEY: String = "codelist-sync"
    }

    private val sqlNonArchivedDocuments = """
        SELECT d.uuid, d.data 
        FROM document d
        JOIN document_wrapper dw ON d.uuid = dw.uuid
        JOIN catalog c ON dw.catalog_id = c.id
        WHERE c.identifier = ?
        AND dw.deleted = 0
        AND d.state != 'ARCHIVED'
        LIMIT ? OFFSET ?
    """.trimIndent()

    private val sqlCountNonArchivedDocuments = """
        SELECT COUNT(d.uuid)
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

    private val batchSize = 100 // Process 100 documents at a time

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Codelist Synchronization")
        val catalogIdentifier = context.mergedJobDataMap!!.getString("catalogId")
        val notificationType = MessageTarget(NotificationType.CODELIST_SYNCHRONISATION, catalogIdentifier)

        val message = Message(Date(), 0)
        message.message = "Starting codelist synchronization"
        notifier.sendMessage(notificationType, message)
        val catalog = catalogService.getCatalogById(catalogIdentifier)
        val catalogLanguage = catalog.settings.config.language ?: "de"

        try {
            // Get total count of documents to process
            val totalDocuments =
                jdbcTemplate.queryForObject(sqlCountNonArchivedDocuments, Int::class.java, catalogIdentifier) ?: 0
            log.info("Found $totalDocuments documents to process")

            var processedCount = 0
            var offset = 0

            // Process documents in batches
            while (offset < totalDocuments) {
                log.info("Processing batch: offset=$offset, limit=$batchSize")

                val batchCount = jdbcTemplate.query(sqlNonArchivedDocuments, { rs, index ->
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
                        log.debug("Updating document with UUID: $uuid")

                        jdbcTemplate.update(updateSql, updatedJson, uuid)
                    }

                    if (jsonPaths.isNotEmpty()) {
                        log.debug("Found ${jsonPaths.size} paths with key field in document: $jsonPaths")
                    }
                    message.progress = (((processedCount + index) / totalDocuments) * 100).toInt()
                    notifier.sendMessage(notificationType, message)

                    1 // Return 1 for each document processed
                }, catalogIdentifier, batchSize, offset).sum()

                processedCount += batchCount
                offset += batchSize

                log.info("Processed $batchCount documents in current batch, total processed: $processedCount/$totalDocuments")
            }

            message.message = "Codelist synchronization completed successfully. Processed $processedCount documents."
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
                log.info("Codelist entry not found for id: $entryKey at path: $path for uuid: $uuid. Converting to free entry")
                (node as ObjectNode).put("key", null as String?)
                return true
            } else if (node.getString("value") != codelistEntryValue) {
                log.info(
                    "Codelist entry value changed for id: $entryKey at path: $path for uuid: $uuid. From ${
                        node.getString(
                            "value",
                        )
                    } to $codelistEntryValue",
                )
                (node as ObjectNode).put("value", codelistEntryValue)
                return true
            }
        }
        return false
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
