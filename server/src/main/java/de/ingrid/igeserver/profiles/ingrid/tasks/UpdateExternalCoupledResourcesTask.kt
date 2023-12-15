/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.tasks

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.CapabilitiesService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.io.FileNotFoundException

@Component
class UpdateExternalCoupledResourcesTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val documentService: DocumentService,
    val capabilitiesService: CapabilitiesService
) {

    val log = logger()
    val mapper = jacksonObjectMapper()

    @Scheduled(cron = "\${cron.externalCoupledResources.expression}")
    fun updateExternalCoupledResources(): String {
        setAdminAuthentication()
        val summary = mutableMapOf<Int, Summary>()
        val urlCache = mutableMapOf<String, GetRecordUrlAnalysis>()
        getAllExternalCoupledResources().forEach {
            updateResource(it, urlCache, summary)
        }

        printSummary(summary)
        return summary.toString()
    }

    private fun printSummary(summaries: MutableMap<Int, Summary>) {
        summaries.forEach { (catalogId, summary) ->
            log.info("Summary for catalog: $catalogId")
            log.info("Checked Coupled Resource URLs: " + summary.count)
            log.info("Corrupted URLs: " + summary.corrupt)
            log.info("Updated Coupled Resource Identifiers: " + summary.updated)
        }
    }

    private fun updateResource(
        resource: CoupledResourceResult,
        urlCache: MutableMap<String, GetRecordUrlAnalysis>,
        summaries: MutableMap<Int, Summary>
    ) {
        val summary = summaries.getOrPut(resource.catalogId) { Summary(0, 0, 0) }
        
        resource.links.forEach {
            if (it.url == null) return@forEach

            try {
                if (!urlCache.containsKey(it.url)) summary.count++
                val record = urlCache[it.url] ?: capabilitiesService.analyzeGetRecordUrl(it.url)
                
                urlCache[it.url] = record
                if (it.identifier != record.identifier || it.uuid != record.uuid) {
                    updateDocument(resource.id, it.url, record)
                    summary.updated++
                    log.info("External Coupled Resource Identifier changed from: " + it.identifier + " to: " + record.identifier + " for UUID: " + it.uuid)
                } else {
                    log.debug("Coupled Resource Identifier did not change");
                }
            } catch (ex: FileNotFoundException) {
                log.warn("Resource not found: ${it.url}")
                summary.corrupt++
            }
        }
    }

    private fun updateDocument(id: Int, url: String, record: GetRecordUrlAnalysis) {
        val doc = documentService.docRepo.findById(id).get().apply {
            val arrayNode = data.get("service").get("coupledResources") as ArrayNode
            arrayNode.forEach {
                if (it.get("url")?.asText() == url) {
                    it as ObjectNode
                    it.put("uuid", record.uuid)
                    it.put("identifier", record.identifier)
                    it.put("title", record.title)
                }
            }
        }

        documentService.docRepo.save(doc)
    }

    private fun getAllExternalCoupledResources(): List<CoupledResourceResult> {
        ClosableTransaction(transactionManager).use {
            return entityManager.createNativeQuery(
                """
    SELECT id, uuid, (data -> 'service' -> 'coupledResources'), catalog_id FROM document
    WHERE (state = 'PUBLISHED' OR state = 'DRAFT' OR state = 'DRAFT_AND_PUBLISHED' OR state = 'PENDING')
      AND jsonb_path_exists(jsonb_strip_nulls(data), '$.service.coupledResources')
      AND EXISTS(SELECT
                 FROM jsonb_array_elements(data -> 'service' -> 'coupledResources') as cr
          WHERE (cr -> 'isExternalRef')\:\:bool = true);
          """.trimIndent()
            )
                .resultList
                .map { mapToCoupledResourceResult(it as Array<Any>) }
        }
    }

    private fun mapToCoupledResourceResult(result: Array<Any>): CoupledResourceResult {
        return CoupledResourceResult(
            result[0] as Int,
            result[1].toString(),
            mapper.readValue(result[2] as String, object : TypeReference<List<CoupledResource>>() {})
                .filter { it.isExternalRef },
            result[3] as Int
        )
    }

    private data class Summary(var count: Int, var corrupt: Int, var updated: Int)

    private data class CoupledResourceResult(val id: Int, val uuid: String, val links: List<CoupledResource>, val catalogId: Int)

    private data class CoupledResource(
        var uuid: String?,
        var identifier: String?,
        val url: String?,
        val title: String?,
        val isExternalRef: Boolean
    )
}

