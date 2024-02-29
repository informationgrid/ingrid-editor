/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.index.QueryInfo
import de.ingrid.igeserver.persistence.filter.PostIndexPayload
import de.ingrid.igeserver.persistence.filter.PostIndexPipe
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
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
    val message: IndexMessage,
    private val catalogProfile: CatalogProfile,
    private val notify: IndexingNotifier,
    private val indexService: IndexService,
    val catalogId: String,
    val generalProperties: GeneralProperties,
    private val plugInfo: IPlugInfo,
    private val postIndexPipe: PostIndexPipe,
    private val settingsService: SettingsService,
) {

    val log = logger()
    private val categoryAlias = indexService.getIndexIdentifier(plugInfo.alias, config.category)

    fun indexAll() {

        log.info("Indexing to target '${config.target}' in category: " + config.category.value)

        // pre phase
        val (oldIndex, newIndex) = indexPrePhase() ?: return

        val indexInfo = IndexInfo(newIndex, categoryAlias, config.indexFieldId)
        val queryInfo = QueryInfo(catalogId, config.category.value, config.tags, config.exporter!!.exportSql(catalogId))
        val totalHits: Long = indexService.getNumberOfPublishableDocuments(queryInfo)
        val targetMessage = message.getTargetByName(config.target.name)
        updateMessageWithDocumentInfo(targetMessage, totalHits)

        try {
            var page = -1
            do {
                page++
                val docsToPublish = indexService.getPublishedDocuments(queryInfo, page)

                exportDocuments(docsToPublish, indexInfo)
            } while (!checkIfAllIndexed(page, docsToPublish, totalHits))

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

    private fun checkIfAllIndexed(
        page: Int,
        docsToPublish: Page<DocumentIndexInfo>,
        totalHits: Long
    ): Boolean {
        val numExported = page * generalProperties.indexPageSize + docsToPublish.numberOfElements
        val isLast = numExported.toLong() == totalHits
        return isLast
    }

    private fun indexPrePhase(): Pair<String?, String>? {
        return try {
            val newIndex = IndexService.getNextIndexName(categoryAlias, "", plugInfo.alias)

            val oldIndex = config.target.getIndexNameFromAliasName(plugInfo.alias, categoryAlias)
            config.target.createIndex(
                newIndex,
                if (config.category == DocumentCategory.ADDRESS) "address" else "base",
                catalogProfile.getElasticsearchMapping(""),
                catalogProfile.getElasticsearchSetting("")
            )
            Pair(oldIndex, newIndex)
        } catch (ex: Exception) {
            notify.addAndSendMessageError(message, ex, "Error during Index Pre-Phase: ")
            null
        }
    }

    private fun updateMessageWithDocumentInfo(message: TargetMessage, totalHits: Long) {
        if (config.category == DocumentCategory.DATA) {
            message.numDocuments = totalHits.toInt()
        } else {
            message.numAddresses = totalHits.toInt()
        }
    }

    private fun exportDocuments(docsToPublish: Page<DocumentIndexInfo>, indexInfo: IndexInfo) {
        val targetMessage = message.getTargetByName(config.target.name)

        docsToPublish.content.forEach { doc ->
//            handleCancelation()
            increaseProgressInTargetMessage(targetMessage)
            notify.sendMessage(message)

            try {
                exportAndIndexSingleDocument(doc.document, indexInfo)
            } catch (ex: Exception) {
                handleExportException(ex, doc, targetMessage)
            } ?: return@forEach
        }
    }

    fun exportAndIndexSingleDocument(doc: Document, indexInfo: IndexInfo) {
        log.debug("export '${doc.uuid}' with exporter '${config.exporter!!.typeInfo.type}' to target '${config.target.name}'")
        val (exportedDoc, exporterType) =
            Pair(config.exporter.run(doc, catalogId), config.exporter.typeInfo.type)
        
        try {
            val elasticDocument = convertToElasticDocument(exportedDoc)
            config.target.update(indexInfo, elasticDocument)
            val simpleContext = SimpleContext(catalogId, catalogProfile.identifier, doc.uuid)

            postIndexPipe.runFilters(
                PostIndexPayload(elasticDocument, config.category.name, exporterType),
                simpleContext
            )
        } catch (ex: Exception) {
            handleIndexException(doc, ex)
        }
    }

    private fun handleIndexException(doc: Document, ex: Exception) {
        val errorMessage =
            "Error in PostIndexFilter or during sending to Elasticsearch: '${doc.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
        log.error(errorMessage, ex)
        message.errors.add(errorMessage)
        notify.sendMessage(message)
    }

    private fun handleExportException(
        ex: Exception,
        doc: DocumentIndexInfo,
        targetMessage: TargetMessage,
    ): Nothing? {
        if (ex is IndexException && ex.errorCode == "FOLDER_WITH_NO_CHILDREN") {
            log.debug("Ignore folder with no published datasets: ${ex.message}")
        } else {
            val errorMessage =
                "Error exporting document '${doc.document.uuid}' in catalog '$catalogId': ${ex.cause?.message ?: ex.message}"
            log.error(errorMessage, ex)
            message.errors.add(errorMessage)
            increaseProgressInTargetMessage(targetMessage)
        }
        return null
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

        val plugId = "ige-ng_${plugInfo.catalog.identifier}"
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
                                plugInfo.catalog.name
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

        val indices = config.target.getIndices(indexGroup)
        for (indexToDelete in indices) {
            if (indexToDelete != index) {
                config.target.deleteIndex(indexToDelete)
            }
        }
    }

//    private fun handleCancelation() {
//
//        if (this.cancellations[catalogId] == true) {
//            this.cancellations[catalogId] = false
//            notify.sendMessage(
//                message.apply {
//                    this.endTime = Date()
//                    this.errors.add("Indexing cancelled")
//                }
//            )
//            throw IndexException.wasCancelled()
//        }
//    }

    private fun increaseProgressInTargetMessage(message: TargetMessage) {
        message.apply {
            if (config.category == DocumentCategory.DATA) this.progressDocuments += 1
            else this.progressAddresses += 1
        }
        this.message.increaseProgress()
    }
}
