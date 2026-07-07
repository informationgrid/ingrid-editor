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
package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.ZabbixProperties
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.index.QueryInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.runAsAdmin
import de.ingrid.igeserver.zabbix.ZabbixService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
@Profile("zabbix")
class ExpiredZabbixTask(
    val documentService: DocumentService,
    val catalogService: CatalogService,
    val indexService: IndexService,
    val catalogRepo: CatalogRepository,
    val indexingTask: IndexingTask,
    val generalProperties: GeneralProperties,
    val zabbixProperties: ZabbixProperties,
    val zabbixService: ZabbixService,
) {
    val log = logger()

    val defaultUuidPattern = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" // (lowercase UUID)

    @Scheduled(cron = "\${zabbix.cleanup.schedule}")
    fun cleanup() {
        runAsAdmin("ExpiredZabbix", "Task") { _ ->
            zabbixService.activatedCatalogs
                .forEach { catalogId ->
                    try {
                        log.info("Run ExpiredZabbixTask for catalog $catalogId")
                        val catalog = catalogRepo.findByIdentifier(catalogId)
                        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
                        val configs = indexingTask.getExporterConfigForCatalog(catalog, catalogProfile)
                        processExpiredDocuments(catalogId, configs)
                    } catch (e: Exception) {
                        log.warn("Documents not found in catalog $catalogId", e)
                    }
                }
            zabbixService.cleanupExpiredWebscenarios()
        }
    }

    private fun processExpiredDocuments(catalogId: String, configs: List<ExtendedExporterConfig>) {
        configs
            .filter { it.category == DocumentCategory.DATA }
            .forEach { config ->
                val queryInfo = QueryInfo(
                    catalogId,
                    config.category.value,
                    config.tags,
                    config.exporter.exportSql(catalogId),
                )

                // collect published document UUIDs from the index
                val docsPublished = mutableListOf<String>()
                val totalHits = indexService.getNumberOfPublishableDocuments(queryInfo)

                collectPublishedDocumentUuids(queryInfo, totalHits, docsPublished)

                log.info("Found ${docsPublished.size} published documents to process in catalog $catalogId")

                // find expired documents
                val docsZabbix = zabbixService.getHostIds(catalogId)
                val docsToUpdate = docsZabbix.toMutableList()
                val pattern = zabbixProperties.cleanup.pattern.ifEmpty { defaultUuidPattern }
                val uuidRegex = Regex(pattern, RegexOption.IGNORE_CASE)
                docsZabbix.forEach { doc ->
                    docsPublished
                        .find { doc == it || !uuidRegex.matches(doc) }
                        ?.let { docsToUpdate.remove(doc) }
                        ?: log.info("Zabbix document $doc not found in published documents of catalog $catalogId")
                }
                updateExpiredDocuments(catalogId, docsToUpdate, docsPublished.size)
            }
    }

    private fun collectPublishedDocumentUuids(
        queryInfo: QueryInfo,
        totalHits: Long,
        docsPublished: MutableList<String>,
    ) {
        var page = -1
        do {
            page++
            val publishedDocuments = indexService.getPublishedDocuments(queryInfo, page)
            publishedDocuments.forEach {
                docsPublished.add(it.document.uuid)
            }

            val numExported = page * generalProperties.indexPageSize + publishedDocuments.numberOfElements
            val isLastPage = numExported.toLong() >= totalHits
        } while (!isLastPage && !publishedDocuments.isEmpty)
    }

    private fun updateExpiredDocuments(catalogId: String, docsToUpdate: List<String>, totalPublishedDocs: Int) {
        try {
            // check if documents to update exceed threshold
            val updateThreshold = totalPublishedDocs * zabbixProperties.cleanup.threshold / 100
            if (docsToUpdate.size > updateThreshold) {
                log.warn("Number of documents to update (${docsToUpdate.size}) exceeds ${zabbixProperties.cleanup.threshold}% of published documents ($totalPublishedDocs) in catalog $catalogId, skipping.")
                return
            }
            docsToUpdate.forEach {
                zabbixService.updateDocument(it)
                log.info("Update Zabbix document $it for catalog $catalogId")
            }
            log.info("Updated ${docsToUpdate.size} Zabbix documents for catalog $catalogId")
        } catch (e: Exception) {
            log.error("Could not update documents: ${e.message}", e)
        }
    }
}
