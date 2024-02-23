package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.api.messaging.IndexingNotifier
import de.ingrid.igeserver.api.messaging.TargetMessage
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.extension.pipe.impl.SimpleContext
import de.ingrid.igeserver.index.DocumentIndexInfo
import de.ingrid.igeserver.index.IBusIndexManager
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.SettingsService
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.data.domain.Page
import java.io.IOException
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.*

class IndexTargetWorker(
    val config: ExtendedExporterConfig,
    val category: DocumentCategory,
    val message: IndexMessage,
    val catalogProfile: CatalogProfile,
    val elasticsearchAlias: String,
    val notify: IndexingNotifier,
    val indexService: IndexService,
    val catalogId: String,
    val generalProperties: GeneralProperties,
    val plugInfo: IPlugInfo,
    val catalog: Catalog,
    val postIndexPipe: PostIndexPipe,
    val settingsService: SettingsService,
    val cancellations: HashMap<String, Boolean>,
    val categoryAlias: String
) {

    val log = logger()

    fun run() {

        log.info("Indexing to target '${config.target}' in category: " + category.value)

        // pre phase
        val (oldIndex, newIndex) = indexPrePhase() ?: return

        // TODO: configure index name
        val indexInfo =
            IndexInfo(
                newIndex,
                if (category == DocumentCategory.ADDRESS) "address" else "base",
                categoryAlias,
                if (category == DocumentCategory.ADDRESS) catalogProfile.indexIdField.address
                else catalogProfile.indexIdField.document
            )

        var page = -1
        val totalHits: Long =
            indexService.getNumberOfPublishableDocuments(
                catalogId,
                category.value,
                config.tags,
                catalogProfile
            )
        val targetMessage = message.getTargetByName(config.name)
        updateMessageWithDocumentInfo(targetMessage, totalHits)

        try {
            do {
                page++
                val docsToPublish =
                    indexService.getPublishedDocuments(
                        catalogId,
                        category.value,
                        config.tags,
                        catalogProfile,
                        page,
                        totalHits
                    )
                // isLast function sometimes delivers the next to last page without a
                // total
                // count, so we
                // write our own
                val isLast =
                    (page * generalProperties.indexPageSize + docsToPublish.numberOfElements)
                        .toLong() == totalHits

                exportDocuments(docsToPublish, page, indexInfo)
            } while (!isLast)

            notify.sendMessage(message.apply { this.message = "Post Phase" })

            plugInfo.apply {
                this.oldIndex = oldIndex
                this.newIndex = newIndex
            }
            // post phase
            indexPostPhase(plugInfo)
            log.debug("Task finished: Indexing for $catalogId")
        } catch (ex: IndexException) {
            log.info("Indexing was cancelled")
            removeOldIndices(oldIndex)
            return
        } catch (ex: Exception) {
            notify.addAndSendMessageError(message, ex, "Error during indexing: ")
        }
    }

    private fun indexPrePhase(): Pair<String?, String>? {
        return try {
            val newIndex = IndexService.getNextIndexName(categoryAlias, "", elasticsearchAlias)

            val oldIndex =
                config.target.getIndexNameFromAliasName(elasticsearchAlias, categoryAlias)
            config.target.createIndex(
                newIndex,
                if (category == DocumentCategory.ADDRESS) "address" else "base",
                catalogProfile.getElasticsearchMapping(""),
                catalogProfile.getElasticsearchSetting("")
            )
            Pair(oldIndex, newIndex)
        } catch (ex: Exception) {
            notify.addAndSendMessageError(message, ex, "Error during Index Pre-Phase: ")
            null
        }
    }

    private fun index(
        config: ExtendedExporterConfig,
        indexInfo: IndexInfo,
        elasticDoc: ElasticDocument
    ) {
        if (config.target is IBusIndexManager) {
            config.target.update(indexInfo, elasticDoc, false)
        } else {
            config.target.update(indexInfo, elasticDoc, false)
        }
    }

    private fun updateMessageWithDocumentInfo(message: TargetMessage, totalHits: Long) {
        if (category == DocumentCategory.DATA) {
            message.numDocuments = totalHits.toInt()
        } else {
            message.numAddresses = totalHits.toInt()
        }
    }

    private fun exportDocuments(
        docsToPublish: Page<DocumentIndexInfo>,
        page: Int,
        indexInfo: IndexInfo
    ) {
        val targetMessage = message.getTargetByName(config.name)

        docsToPublish.content
            .mapIndexedNotNull { index, doc ->
                handleCancelation()
                updateTargetMessage(targetMessage, index + (page * generalProperties.indexPageSize))
                notify.sendMessage(message)
                log.debug("export ${doc.document.uuid}")
                val exportedDoc =
                    try {
                        val exporter =
                            if (category == DocumentCategory.DATA) config.exporterData
                            else config.exporterAddress
                        // an exporter might not exist for a category
                        if (exporter == null) return@mapIndexedNotNull null

                        doc.exporterType = exporter.typeInfo.type

                        exporter.run(doc.document, catalogId)
                    } catch (ex: Exception) {
                        if (ex is IndexException && ex.errorCode == "FOLDER_WITH_NO_CHILDREN") {
                            log.debug("Ignore folder with no published datasets: ${ex.message}")
                        } else {
                            val errorMessage =
                                "Error exporting document '${doc.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
                            log.error(errorMessage, ex)
                            message.errors.add(errorMessage)
                            updateTargetMessage(
                                targetMessage,
                                index + (page * generalProperties.indexPageSize)
                            )
                        }
                        null
                    } ?: return@mapIndexedNotNull null
                Pair(doc, exportedDoc)
            }
            .onEach { (docInfo, exportedDoc) ->
                try {
                    val elasticDocument = convertToElasticDocument(exportedDoc)
                    index(config, indexInfo, elasticDocument)
                    val simpleContext =
                        SimpleContext(catalogId, catalogProfile.identifier, docInfo.document.uuid)

                    postIndexPipe.runFilters(
                        PostIndexPayload(elasticDocument, category.name, docInfo.exporterType!!),
                        simpleContext
                    )
                } catch (ex: Exception) {
                    val errorMessage =
                        "Error in PostIndexFilter or during sending to Elasticsearch: '${docInfo.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
                    log.error(errorMessage, ex)
                    message.errors.add(errorMessage)
                    notify.sendMessage(message)
                }
            }
    }

    private fun indexPostPhase(info: IPlugInfo) {
        // update central index with iPlug information
        updateIBusInformation(info)

        // switch alias and delete old index
        config.target.switchAlias(info.alias, info.oldIndex, info.newIndex)
        removeOldIndices(info.newIndex)
    }

    private fun updateIBusInformation(info: IPlugInfo) {
        val plugIdInfo = "ige-ng:${info.alias}:${info.category}"
        config.target.updateIPlugInformation(
            plugIdInfo,
            getIPlugInfo(plugIdInfo, info, info.category == "address")
        )
    }

    @Throws(IOException::class)
    private fun getIPlugInfo(infoId: String, info: IPlugInfo, forAddress: Boolean): String {

        val plugId = "ige-ng_${catalog.identifier}"
        val currentDate = OffsetDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)

        return jacksonObjectMapper()
            .createObjectNode()
            .apply {
                put("plugId", plugId)
                put("indexId", infoId)
                put("iPlugName", prepareIPlugName(infoId))
                put("linkedIndex", info.newIndex)
                put("linkedType", if (forAddress) "address" else "base")
                put("adminUrl", generalProperties.host)
                put("lastHeartbeat", currentDate)
                put("lastIndexed", currentDate)
                set<JsonNode>(
                    "plugdescription",
                    jacksonObjectMapper()
                        .convertValue(
                            settingsService.getPlugDescription(
                                info.partner,
                                info.provider,
                                plugId,
                                forAddress,
                                catalog.name
                            ),
                            JsonNode::class.java
                        )
                )
                set<JsonNode>(
                    "indexingState",
                    jacksonObjectMapper().createObjectNode().apply {
                        put("numProcessed", 0)
                        put("totalDocs", 0)
                        put("running", false)
                    }
                )
            }
            .toString()
    }

    private fun convertToElasticDocument(doc: Any): ElasticDocument {
        return jacksonObjectMapper().readValue(doc.toString(), ElasticDocument::class.java)
    }

    private fun prepareIPlugName(infoId: String): String {
        val splitted = infoId.split(":")
        return "IGE-NG (${splitted[1]}:${splitted[2]})"
    }

    private fun removeOldIndices(index: String?) {
        if (index == null) return

        val delimiterPos = index.lastIndexOf("_")
        val indexGroup = index.substring(0, delimiterPos + 1)

        val indices: Array<String> = config.target.getIndices(indexGroup)
        for (indexToDelete in indices) {
            if (indexToDelete != index) {
                config.target.deleteIndex(indexToDelete)
            }
        }
    }

    private fun handleCancelation() {

        if (this.cancellations[catalogId] == true) {
            this.cancellations[catalogId] = false
            notify.sendMessage(
                message.apply {
                    this.endTime = Date()
                    this.errors.add("Indexing cancelled")
                }
            )
            throw IndexException.wasCancelled()
        }
    }

    private fun updateTargetMessage(message: TargetMessage, index: Int) {
        if (category == DocumentCategory.DATA) {
            message.apply {
                this.progressDocuments = index + 1
                this.progress = (((this.progressDocuments + 0f) / this.numDocuments) * 100).toInt()
            }
        } else {
            message.apply {
                this.progressAddresses = index + 1
                this.progress = (((this.progressAddresses + 0f) / this.numDocuments) * 100).toInt()
            }
        }
    }
}
