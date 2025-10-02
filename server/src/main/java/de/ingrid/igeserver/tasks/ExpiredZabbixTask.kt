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

package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.ZabbixProperties
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.index.QueryInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
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

    @Scheduled(cron = "\${zabbix.cleanup.schedule}")
    fun cleanup() {
        zabbixService.activatedCatalogs
            .map { catalogId ->
                try {
                    log.debug("Zabbix catalog $catalogId")
                    val catalog = catalogRepo.findByIdentifier(catalogId)
                    val catalogProfile = catalogService.getCatalogProfile(catalog.type)
                    val configs = indexingTask.getExporterConfigForCatalog(catalog, catalogProfile)
                    findDocuments(catalogId, configs)
                } catch (e: Exception) {
                    log.warn("Documents not found in catalog $catalogId")
                }
            }
    }

    private fun findDocuments(catalogId: String, configs: List<ExtendedExporterConfig>) {
        configs
            .filter { it.category == DocumentCategory.DATA }
            .forEach { config ->
                val queryInfo = QueryInfo(
                    catalogId,
                    config.category.value,
                    config.tags,
                    config.exporter.exportSql(catalogId),
                )
                val docsPublished = mutableListOf<String>()
                val totalHits = indexService.getNumberOfPublishableDocuments(queryInfo)
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
                log.debug("Found ${docsPublished.size} documents to process in catalog $catalogId")

                val docsZabbix = zabbixService.getHostIds(catalogId)
                val docsToDelete = docsZabbix.toMutableList()
                // uuid pattern
                val pattern = zabbixProperties.cleanup.pattern.ifEmpty {
                    "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
                }
                val uuidRegex = Regex(pattern, RegexOption.IGNORE_CASE)
                docsZabbix.forEach { doc ->
                    docsPublished
                        .find { doc == it || !uuidRegex.matches(doc) }
                        ?.let { docsToDelete.remove(doc) }
                        ?: log.debug("Document $doc not found in catalog $catalogId")
                }
                deleteDocuments(catalogId, docsToDelete, docsPublished.size)
            }
    }

    private fun deleteDocuments(catalogId: String, docsToDelete: List<String>, totalPublishedDocs: Int) {
        try {
            // check if documents to delete exceed threshold
            val deleteThreshold = totalPublishedDocs * zabbixProperties.cleanup.threshold / 100
            if (docsToDelete.size > deleteThreshold) {
                log.warn("Number of documents to delete (${docsToDelete.size}) exceeds ${zabbixProperties.cleanup.threshold}% of published documents ($totalPublishedDocs) in catalog $catalogId, skipping.")
                return
            }
            docsToDelete.forEach { zabbixService.deleteDocument(it) }
            log.debug("Deleted ${docsToDelete.size} documents from catalog $catalogId")
        } catch (e: Exception) {
            log.error("Could not delete documents: ${e.message}")
        }
    }
}
