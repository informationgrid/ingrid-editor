/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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

import de.ingrid.codelists.CodeListService
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.index.IIndexManager
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.index.QueryInfo
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ExportConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.tasks.quartz.IgeJob
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import java.util.*
import java.util.concurrent.ScheduledFuture

data class ExtendedExporterConfig(
    val target: IIndexManager,
    val exporter: IgeExporter,
    val tags: List<String>,
    val category: DocumentCategory,
    val indexFieldId: String
)

@Component
@PersistJobDataAfterExecution
class IndexingTask(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val catalogRepo: CatalogRepository,
    private val codelistService: CodeListService,
    private val postIndexPipe: PostIndexPipe,
    private val generalProperties: GeneralProperties,
    private val connectionService: ConnectionService
) : IgeJob() {

    override val log = logger()

    private val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)

    override fun run(context: JobExecutionContext) {
        val catalogId = context.mergedJobDataMap.getString("catalogId")

        runAsCatalogAdmin()
        startIndexing(context, catalogId)
    }

    /** Indexing of all published documents into an Elasticsearch index. */
    private fun startIndexing(context: JobExecutionContext, catalogId: String) {
        log.info("Starting Task: Indexing for $catalogId")

        val message = IndexMessage(catalogId, 0)
        notify.sendMessage(
            message.apply { this.message = "Start Indexing for catalog: $catalogId" }
        )

        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)

        try {
            // get all targets we want to export to
            val targets = getExporterConfigForCatalog(catalog, catalogProfile)

            setTotalDatasetsToMessage(message, targets)

            // make sure the ingrid_meta index is there
            handleInformationIndex(targets)

            run indexingLoop@{
                targets
                    .forEach { target ->
                        val plugInfo = createIPlugInfo(catalog, target.category)
                        log.info("Running export on thread: ${Thread.currentThread()}")

                        IndexTargetWorker(
                            target,
                            message,
                            catalogProfile,
                            notify,
                            indexService,
                            catalogId,
                            generalProperties,
                            plugInfo,
                            postIndexPipe,
                            settingsService
                        ).indexAll()

                        // make sure to write everything to elasticsearch
                        // if another indexing starts right afterward, then the previous index could still be there
                        target.target.flush()
                    }
            }
        } catch (ex: InterruptedException) {
            notify.addAndSendMessageError(message, null, "Indexing was cancelled")
        } catch (ex: Exception) {
            notify.addAndSendMessageError(message, ex, "Error during indexing: ")
        } catch (ex: NotImplementedError) {
            notify.addAndSendMessageError(message, ServerException.withReason("Not Implemented"))

        }

        log.info("Indexing finished")
        notify.sendMessage(
            message.apply {
                this.endTime = Date()
                this.message = "Indexing finished"
            }
        )

        // save last indexing information to database for this catalog to get this in frontend
        message.report = message.targets
        finishJob(context, message)
    }

    private fun setTotalDatasetsToMessage(message: IndexMessage, targets: List<ExtendedExporterConfig>) {
        val catalogId = message.catalogId
        val counts = targets.map {
            val queryInfo = QueryInfo(catalogId, it.category.value, it.tags, it.exporter.exportSql(catalogId))
            indexService.getNumberOfPublishableDocuments(queryInfo)
        }
        message.totalDatasets = counts.sum()
    }

    private fun createIPlugInfo(catalog: Catalog, category: DocumentCategory): IPlugInfo {
        val partner =
            codelistService.getCodeListValue("110", catalog.settings.config.partner, "ident")
        val provider =
            codelistService.getCodeListValue("111", catalog.settings.config.provider, "ident")

        return IPlugInfo(
            getElasticsearchAliasFromCatalog(catalog),
            null,
            "???",
            category.value,
            partner,
            provider,
            catalog
        )
    }

    private fun handleInformationIndex(configs: List<ExtendedExporterConfig>) {
        configs
            .map { it.target }
            .toSet()
            .forEach { it.checkAndCreateInformationIndex() }
    }

    private fun getExporterConfigForCatalog(
        catalog: Catalog,
        catalogProfile: CatalogProfile
    ): List<ExtendedExporterConfig> {
        val ibusConfigs = settingsService.getIBusConfig()
        val elasticConfig = settingsService.getElasticConfig()

        var exportConfigs = catalog.settings.exports
        if (exportConfigs.isEmpty()) {
            val defaultExportFormatId = catalogProfile.indexExportFormatID
            exportConfigs = getDefaultExporterConfiguration(defaultExportFormatId, ibusConfigs, elasticConfig)
        }

        return exportConfigs.flatMap { config ->
            val connection = settingsService.getConnectionConfig(config.target)
            if (connection == null) {
                val msg = "An exporter configuration contains invalid target: ${config.target}"
                log.error(msg)
                notify.addAndSendMessageError(
                    IndexMessage(catalog.identifier, 0),
                    ServerException.withReason(msg)
                )
                return@flatMap emptyList()
            }

            val target = connectionService.getIndexerForConnection(config.target)

            categories.mapNotNull {
                // skip configs where no exporter is defined
                val exporter = getExporterOrNull(it, config.exporterId) ?: return@mapNotNull null
                ExtendedExporterConfig(
                    target,
                    exporter,
                    config.tags,
                    it,
                    if (it == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address
                    else catalogProfile.indexIdField.document
                )
            }
        }
    }

    /**
     * The default configuration is to use all configured connections and export with "internet" tag
     * and first defined exporter for the profile.
     */
    private fun getDefaultExporterConfiguration(
        exportFormatId: String,
        ibusConfigs: List<IBusConfig>,
        elasticConfig: List<ElasticConfig>
    ): List<ExportConfig> {
        val iBusDefinitions = ibusConfigs.map {
            ExportConfig(it.id!!, exportFormatId, listOf("internet"))
        }
        val elasticDefinitions = elasticConfig.map {
            ExportConfig(it.id!!, exportFormatId, listOf("internet"))
        }
        return iBusDefinitions + elasticDefinitions
    }

    private fun getExporterOrNull(category: DocumentCategory, exporterId: String): IgeExporter? {
        return try {
            indexService.getExporter(category, exporterId)
        } catch (e: ConfigurationException) {
            null
        }
    }

    private fun getElasticsearchAliasFromCatalog(catalog: Catalog) =
        catalog.settings.config.elasticsearchAlias ?: catalog.identifier

    /** Indexing of a single document into an Elasticsearch index. */
    fun updateDocument(
        catalogId: String,
        category: DocumentCategory,
        docId: String
    ) {
        log.info("Export dataset from catalog '$catalogId': $docId")

        runAsCatalogAdmin()

        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
        val configs = getExporterConfigForCatalog(catalog, catalogProfile)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)

        try {
            configs
                .filter { it.category == category }
                .forEach {
                    val queryInfo = QueryInfo(catalogId, category.value, it.tags, it.exporter.exportSql(catalogId))
                    val doc = indexService.getSinglePublishedDocument(queryInfo, docId)
                    val indexInfo = getOrPrepareIndex(it, catalogProfile, category, elasticsearchAlias)
                    val plugInfo = createIPlugInfo(catalog, it.category)
                    IndexTargetWorker(
                        it,
                        IndexMessage(catalogId, 1),
                        catalogProfile,
                        notify,
                        indexService,
                        catalogId,
                        generalProperties,
                        plugInfo,
                        postIndexPipe,
                        settingsService,
                    )
                        .exportAndIndexSingleDocument(doc.document, indexInfo)
                }
        } catch (ex: NoSuchElementException) {
            log.info(
                "Document not indexed, probably because of profile specific condition: $catalogId -> $docId"
            )
        }
    }

    private fun getOrPrepareIndex(
        exporter: ExtendedExporterConfig,
        catalogProfile: CatalogProfile,
        category: DocumentCategory,
        elasticsearchAlias: String
    ): IndexInfo {
        val categoryAlias = indexService.getIndexIdentifier(elasticsearchAlias, category)
        var currentIndex =
            exporter.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        if (currentIndex == null) {
            currentIndex = IndexService.getNextIndexName(categoryAlias, "", elasticsearchAlias)
            exporter.target.createIndex(
                currentIndex,
                if (exporter.category == DocumentCategory.ADDRESS) "address" else "base",
                catalogProfile.getElasticsearchMapping(""),
                catalogProfile.getElasticsearchSetting("")
            )
            exporter.target.switchAlias(elasticsearchAlias, null, currentIndex)
        }

        return IndexInfo(
            currentIndex,
            elasticsearchAlias,
            if (category == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address
            else catalogProfile.indexIdField.document
        )
    }
    
    fun removeFromIndex(catalogId: String, id: String, category: String) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
        val configs = getExporterConfigForCatalog(catalog, catalogProfile)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val enumCategory = DocumentCategory.entries.first { it.value == category }
        val categoryAlias = indexService.getIndexIdentifier(elasticsearchAlias, enumCategory)

        configs.forEach {
            try {
                val oldIndex =
                    it.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)

                if (oldIndex != null && it.target.indexExists(oldIndex)) {
                    val info = IndexInfo(oldIndex, elasticsearchAlias, null)
                    it.target.delete(info, id, true)
                }
            } catch (ex: Exception) {
                throw NoElasticsearchConnectionException.withReason(
                    ex.message ?: "No connection to Elasticsearch"
                )
            }
        }
    }
}

data class IndexConfig(
    val catalogId: String,
    val exportFormat: String,
    val cron: String,
    var future: ScheduledFuture<*>? = null,
    val onStartup: Boolean = false
)

data class IPlugInfo(
    val alias: String,
    var oldIndex: String?,
    var newIndex: String,
    val category: String,
    val partner: String?,
    val provider: String?,
    val catalog: Catalog
)
