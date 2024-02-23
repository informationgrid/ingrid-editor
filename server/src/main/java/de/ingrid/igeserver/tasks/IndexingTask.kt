/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European
 * Commission - subsequent versions of the EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence. You may obtain a copy of the
 * Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence
 * is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the Licence for the specific language governing permissions and limitations under
 * the Licence.
 */
package de.ingrid.igeserver.tasks

import de.ingrid.codelists.CodeListService
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.api.messaging.TargetMessage
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.index.*
import de.ingrid.igeserver.model.IndexCronOptions
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.jetbrains.kotlin.backend.common.push
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
    val exporterData: IgeExporter?,
    val exporterAddress: IgeExporter?,
    val tags: List<String>
)

@Component
@Profile("elasticsearch")
class IndexingTask(
    private val indexService: IndexService,
    private val settingsService: SettingsService,
    private val catalogService: CatalogService,
    private val notify: IndexingNotifier,
    private val iBusIndexManager: IBusIndexManager,
    private val catalogRepo: CatalogRepository,
    private val codelistService: CodeListService,
    private val postIndexPipe: PostIndexPipe,
    private val generalProperties: GeneralProperties
) : SchedulingConfigurer, DisposableBean {

    val log = logger()
    val executor = Executors.newSingleThreadScheduledExecutor()
    private val scheduler: TaskScheduler = initScheduler()
    private val scheduledFutures: MutableCollection<IndexConfig> = mutableListOf()
    private val cancellations = HashMap<String, Boolean>()

    fun indexByScheduler(catalogId: String) {
        Timer("ManualIndexing", true).schedule(0) {
            runAsCatalogAdministrator()
            startIndexing(catalogId)
        }
    }

    /** Indexing of all published documents into an Elasticsearch index. */
    fun startIndexing(catalogId: String) {
        log.info("Starting Task: Indexing for $catalogId")

        val message = IndexMessage(catalogId)
        notify.sendMessage(
            message.apply { this.message = "Start Indexing for catalog: $catalogId" }
        )
        val categories = listOf(DocumentCategory.DATA, DocumentCategory.ADDRESS)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        //        val format = catalog.settings.exports.map { it.exporterId }.firstOrNull() ?: "???"
        // TODO: prepare iPlugInfo in separate function (to contain partner, provider and other non
        //       changing things)
        val partner =
            codelistService.getCodeListValue("110", catalog.settings.config.partner, "ident")
        val provider =
            codelistService.getCodeListValue("111", catalog.settings.config.provider, "ident")
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)


        // get all targets we want to export to
        val targets = getExporterConfigForCatalog(catalog)

        // make sure the ingrid_meta index is there
        handleInformationIndex(targets)
        //        val indexManager = config[0].target

        run indexingLoop@{
            targets.forEach { target ->
                val targetMessage = TargetMessage(target.name).also { message.targets.push(it)}
                categories.forEach categoryLoop@{ category ->
                    val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)
                    val plugInfo = IPlugInfo(
                        elasticsearchAlias,
                        null,
                        "???",
                        category.value,
                        partner,
                        provider,
                        catalog
                    )

                    IndexTargetWorker(target, category, message, catalogProfile, elasticsearchAlias, notify, indexService, catalogId, generalProperties,
                        plugInfo, catalog, postIndexPipe, settingsService, cancellations, categoryAlias).run()
                }
            }
        }

        // make sure to write everything to elasticsearch
        // if another indexing starts right afterwards, then the previous index could still be there
        targets.forEach { it.target.flush() }

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

    private fun handleInformationIndex(configs: List<ExtendedExporterConfig>) {
        configs.forEach { it.target.checkAndCreateInformationIndex() }
    }

    private fun getExporterConfigForCatalog(catalog: Catalog): List<ExtendedExporterConfig> {
        val ibusConfigs = settingsService.getIBusConfig()
        val elasticConfig = settingsService.getElasticConfig()

        return catalog.settings.exports.mapNotNull { config ->
            val ibus = ibusConfigs.find { it.id!! == config.target }
            val elastic = elasticConfig.find { it.id!! == config.target }
            if (ibus == null && elastic == null) {
                val msg = "An exporter configuration contains invalid target: ${config.target}"
                log.error(msg)
                notify.addAndSendMessageError(
                    IndexMessage(catalog.identifier),
                    ServerException.withReason(msg)
                )
                return@mapNotNull null
            }

            val (name, target) =
                if (ibus != null) {
                    Pair(ibus.name, IBusIndexer(iBusIndexManager, ibusConfigs.indexOf(ibus)))
                } else Pair(elastic?.name!!, ElasticIndexer(elasticConfig.indexOf(elastic)))

            ExtendedExporterConfig(
                name,
                target,
                getExporterOrNull(DocumentCategory.DATA, config.exporterId),
                getExporterOrNull(DocumentCategory.ADDRESS, config.exporterId),
                config.tags
            )
        }
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
        log.info("Export dataset to Elasticsearch: $catalogId/$docId")

        runAsCatalogAdministrator()

        val exporter = indexService.getExporter(category, format)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val configs = getExporterConfigForCatalog(catalog)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val catalogProfile = catalogService.getCatalogProfile(catalog.type)

        try {
            val doc =
                indexService.getSinglePublishedDocument(
                    catalogId,
                    category.value,
                    configs[0].tags,
                    catalogProfile,
                    docId
                )

            // TODO: loop through all configurations!
            /*val export = exporter.run(doc.document, catalogId)
            log.debug("Exported document: $export")
            val indexInfo =
                getOrPrepareIndex(configs[0], catalogProfile, category, format, elasticsearchAlias)

            val elasticDoc = convertToElasticDocument(export)
            postIndexPipe.runFilters(
                PostIndexPayload(elasticDoc, category.name, exporter.typeInfo.type),
                SimpleContext(catalogId, catalogProfile.identifier, docId)
            )

            index(configs[0], indexInfo, elasticDoc)
            log.info("$catalogId/$docId updated in index: ${indexInfo.getRealIndexName()}")*/
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
        format: String,
        elasticsearchAlias: String
    ): IndexInfo {
        /*val categoryAlias = getIndexIdentifier(elasticsearchAlias, category)
        var oldIndex = exporter.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
        if (oldIndex == null) {
            val (_, newIndex) =
                indexPrePhase(
                    exporter,
                    categoryAlias,
                    catalogProfile,
                    format,
                    elasticsearchAlias,
                    category
                )
            oldIndex = newIndex
            exporter.target.switchAlias(elasticsearchAlias, null, newIndex)
        }*/

        return IndexInfo(
            "???", // TODO: oldIndex,
            if (category == DocumentCategory.ADDRESS) "address" else "base",
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
        val configs = getExporterConfigForCatalog(catalog)
        val elasticsearchAlias = getElasticsearchAliasFromCatalog(catalog)
        val enumCategory = DocumentCategory.values().first { it.value == category }
        val categoryAlias = getIndexIdentifier(elasticsearchAlias, enumCategory)

        configs.forEach {
            try {
                val oldIndex =
                    it.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
                val info =
                    IndexInfo(
                        oldIndex!!,
                        if (category == "address") "address" else "base",
                        elasticsearchAlias,
                        null
                    )

                if (oldIndex != null && it.target.indexExists(oldIndex)) {
                    it.target.delete(info, id, true)
                }
            } catch (ex: Exception) {
                throw NoElasticsearchConnectionException.withReason(
                    ex.message ?: "No connection to Elasticsearch"
                )
            }
        }
    }

    private fun getIndexIdentifier(elasticsearchAlias: String, category: DocumentCategory) =
        "${elasticsearchAlias}_${category.value}"
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
