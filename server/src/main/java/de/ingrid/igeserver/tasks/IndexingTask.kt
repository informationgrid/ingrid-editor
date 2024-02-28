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
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.index.*
import de.ingrid.igeserver.model.IndexCronOptions
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ExportConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.DisposableBean
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.SchedulingConfigurer
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.scheduling.config.ScheduledTaskRegistrar
import org.springframework.scheduling.support.CronTrigger
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import kotlin.concurrent.schedule

data class ExtendedExporterConfig(
    val name: String,
    val target: IIndexManager,
    val exporter: IgeExporter?,
    val tags: List<String>,
    val category: DocumentCategory,
    val indexFieldId: String
)

@Component
@Profile("elasticsearch")
class IndexingTask(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val catalogRepo: CatalogRepository,
    private val codelistService: CodeListService,
    private val postIndexPipe: PostIndexPipe,
    private val generalProperties: GeneralProperties,
    private val iBusService: IBusService,
    private val elasticsearchService: ElasticsearchService,
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()
    private val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)

    fun indexByScheduler(catalogId: String) {
        Timer("ManualIndexing", true).schedule(0) {
            runAsCatalogAdministrator()
            startIndexing(catalogId)
        }
    }

    /** Indexing of all published documents into an Elasticsearch index. */
    fun startIndexing(catalogId: String) {
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
            
            setTotalDatasetsToMessage(message, targets, catalogProfile)
            
            // make sure the ingrid_meta index is there
            handleInformationIndex(targets)

            run indexingLoop@{
                targets
                    .filter { it.exporter != null }
                    .forEach { target ->
                        val plugInfo = createIPlugInfo(catalog, target.category)

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
                                settingsService,
                                cancellations
                            )
                            .indexAll()

                        // make sure to write everything to elasticsearch
                        // if another indexing starts right afterwards, then the previous index could still be there
                        target.target.flush()
                    }
            }
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
        updateIndexLog(catalogId, message)
    }

    private fun setTotalDatasetsToMessage(message: IndexMessage, targets: List<ExtendedExporterConfig>, catalogProfile: CatalogProfile) {
        
        val counts = targets.map { 
            val queryInfo = QueryInfo(message.catalogId, it.category.value, it.tags, catalogProfile)
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
            exportConfigs = getDefaultExporterConfiguration(catalogProfile.indexExportFormatID!!, ibusConfigs, elasticConfig)
        }

        return exportConfigs.flatMap { config ->
            val ibus = ibusConfigs.find { it.id!! == config.target }
            val elastic = elasticConfig.find { it.id!! == config.target }
            if (ibus == null && elastic == null) {
                val msg = "An exporter configuration contains invalid target: ${config.target}"
                log.error(msg)
                notify.addAndSendMessageError(
                    IndexMessage(catalog.identifier, 0),
                    ServerException.withReason(msg)
                )
                return@flatMap emptyList()
            }

            val (name, target) =
                if (ibus != null) {
                    Pair(ibus.name, IBusIndexer(iBusService.getIBus(ibusConfigs.indexOf(ibus))))
                } else Pair(
                    elastic?.name!!, 
                    ElasticIndexer(elasticsearchService.getClient(elasticConfig.indexOf(elastic)))
                )

            categories.map {
                ExtendedExporterConfig(
                    name,
                    target,
                    getExporterOrNull(it, config.exporterId),
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

    private fun updateIndexLog(catalogId: String, message: IndexMessage) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        catalog.settings.lastLogSummary = message
        catalog.modified = OffsetDateTime.now()
        catalogRepo.save(catalog)
    }

    /** Indexing of a single document into an Elasticsearch index. */
    fun updateDocument(
        catalogId: String,
        category: DocumentCategory,
        format: String,
        docId: String
    ) {
        log.info("Export dataset from catalog '$catalogId': $docId")

        runAsCatalogAdministrator()

        val catalog = catalogRepo.findByIdentifier(catalogId)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)
        val configs = getExporterConfigForCatalog(catalog, catalogProfile)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)

        try {
            val doc =
                indexService.getSinglePublishedDocument(
                    catalogId,
                    category.value,
                    configs[0].tags,
                    catalogProfile,
                    docId
                )

            configs
                .filter { it.category == category }
                .forEach {
                    val indexInfo =
                        getOrPrepareIndex(configs[0], catalogProfile, category, elasticsearchAlias)
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
                            cancellations
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

    // check out here:
    // https://stackoverflow.com/questions/39152599/interrupt-spring-scheduler-task-before-next-invocation
    override fun configureTasks(taskRegistrar: ScheduledTaskRegistrar) {

        Timer("IgeTasks", false).schedule(10000) {
            // get index configurations from all catalogs
            getIndexConfigurations()
                .filter { it.cron.isNotEmpty() }
                .forEach { config ->
                    val future = addSchedule(config)
                    config.future = future
                    scheduledFutures.add(config)
                }
        }
    }

    private fun addSchedule(config: IndexConfig): ScheduledFuture<*>? {
        val trigger = CronTrigger(config.cron)
        return scheduler.schedule(
            {
                runAsCatalogAdministrator()
                startIndexing(config.catalogId)
            },
            trigger
        )
    }

    private fun runAsCatalogAdministrator() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "Scheduler",
                "Task",
                listOf(SimpleGrantedAuthority("cat-admin"))
            )
        SecurityContextHolder.getContext().authentication = auth
    }

    fun updateTaskTrigger(catalogId: String, config: IndexCronOptions) {

        val schedule = scheduledFutures.find { it.catalogId == catalogId }
        schedule?.future?.cancel(false)
        scheduledFutures.remove(schedule)
        if (config.cronPattern.isEmpty()) {
            log.info("Indexing Task for '${catalogId}' disabled")
        } else {
            val indexConfig = IndexConfig(catalogId, "IGNORE", config.cronPattern)
            val newFuture = addSchedule(indexConfig)
            indexConfig.future = newFuture
            scheduledFutures.add(indexConfig)
            log.info("Indexing Task for '${catalogId}' rescheduled")
        }
    }

    private fun getIndexConfigurations(): List<IndexConfig> =
        catalogRepo.findAll().mapNotNull { getConfigFromDatabase(it) }

    private fun getConfigFromDatabase(catalog: Catalog): IndexConfig? =
        catalog.settings.indexCronPattern?.let { IndexConfig(catalog.identifier, "IGNORE", it) }

    override fun destroy() {
        executor.shutdownNow()
    }

    private fun initScheduler(): TaskScheduler {
        return ThreadPoolTaskScheduler().apply {
            poolSize = 10
            afterPropertiesSet()
        }
    }

    fun cancelIndexing(catalogId: String) {
        this.cancellations[catalogId] = true
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
