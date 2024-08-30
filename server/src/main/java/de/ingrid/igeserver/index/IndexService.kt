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
package de.ingrid.igeserver.index

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.IndexCronOptions
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ExportConfig
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import de.ingrid.igeserver.services.FIELD_PARENT
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.IndexConfig
import de.ingrid.igeserver.tasks.IndexingTask
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.jpa.AvailableHints
import org.hibernate.query.NativeQuery
import org.quartz.JobKey
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Lazy
import org.springframework.context.event.EventListener
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.text.SimpleDateFormat
import java.util.*

data class DocumentIndexInfo(
    val document: Document,
    val tags: List<String>,
    var exporterType: String? = null,
)

data class QueryInfo(
    val catalogId: String,
    val category: String,
    val types: List<String>,
    val exporterConditions: String,
)

@Service
class IndexService(
    private val catalogRepo: CatalogRepository,
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val entityManager: EntityManager,
    private val generalProperties: GeneralProperties,
    private val schedulerService: SchedulerService,
) {

    private val log = logger()

    companion object {
        const val jobKey: String = "index"

        fun getNextIndexName(name: String): String {
            val dateFormat = SimpleDateFormat("yyyyMMddHHmmssS")
            val date: String = dateFormat.format(Date())

            return name + "_" + date
        }
    }

    @EventListener(ApplicationReadyEvent::class)
    fun onReady() {
        try {
            getIndexConfigurations()
                .filter { it.cron.isNotEmpty() }
                .forEach { config ->
                    val jobKey = JobKey.jobKey(IndexService.jobKey, config.catalogId)
                    try {
                        schedulerService.scheduleByCron(jobKey, IndexingTask::class.java, config.catalogId, config.cron)
                    } catch (e: Exception) {
                        log.error("Error setting up scheduler for '${config.catalogId}' with expression '${config.cron}'", e)
                    }
                }
        } catch (ex: Exception) {
            // ignore any exception during startup
            log.error("Error during setting up scheduler", ex)
        }
    }

    private fun getIndexConfigurations(): List<IndexConfig> =
        catalogRepo.findAll().mapNotNull { getConfigFromDatabase(it) }

    private fun getConfigFromDatabase(catalog: Catalog): IndexConfig? =
        catalog.settings.indexCronPattern?.let { IndexConfig(catalog.identifier, "IGNORE", it.trim()) }

    fun getSinglePublishedDocument(
        queryInfo: QueryInfo,
        uuid: String,
    ): DocumentIndexInfo {
        val docs = requestPublishableDocuments(queryInfo, uuid)
        return docs.single()
    }

    fun getPublishedDocuments(queryInfo: QueryInfo, currentPage: Int = 0): Page<DocumentIndexInfo> {
        val docs =
            requestPublishableDocuments(
                queryInfo,
                null,
                ResearchPaging(currentPage + 1, generalProperties.indexPageSize),
            )
        val pagedDocs =
            PageImpl(docs, Pageable.ofSize(generalProperties.indexPageSize), docs.size.toLong())

        return if (pagedDocs.isEmpty) {
            log.warn("No documents found in category '${queryInfo.category}' for indexing")
            Page.empty()
        } else {
            pagedDocs
        }
    }

    private fun getSystemSpecificConditions(types: List<String>): String {
        var conditions =
            types
                .filter { it != "internet" }
                .joinToString(" OR ") { "'{$it}' && document_wrapper.tags" }
        if (types.contains("internet") || types.isEmpty()) {
            if (conditions.isNotEmpty()) conditions += " OR"
            conditions +=
                " document_wrapper.tags is null OR NOT ('{amtsintern}' && document_wrapper.tags OR '{intranet}' && document_wrapper.tags)"
        }
        return "($conditions)"
    }

    fun getExporter(category: DocumentCategory, exportFormat: String): IgeExporter =
        exportService.getExporter(category, exportFormat)

    fun updateCronConfig(catalogId: String, config: IndexCronOptions) {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val settings = catalog.settings.apply {
            indexCronPattern = config.cronPattern
        }
        catalog.settings = settings
        catalogRepo.save(catalog)

        val jobKey = JobKey.jobKey(IndexService.jobKey, catalogId)
        schedulerService.scheduleByCron(jobKey, IndexingTask::class.java, catalogId, config.cronPattern)
    }

    fun updateExporterConfig(catalogId: String, config: List<ExportConfig>) {
        catalogRepo
            .findByIdentifier(catalogId)
            .apply { settings.exports = config }
            .run { catalogRepo.save(this) }
    }

    fun getLastLog(catalogId: String): IndexMessage? =
        catalogRepo.findByIdentifier(catalogId).settings.lastLogSummary

    fun requestPublishableDocuments(
        queryInfo: QueryInfo,
        uuid: String?,
        paging: ResearchPaging = ResearchPaging(pageSize = generalProperties.indexPageSize),
    ): List<DocumentIndexInfo> {
        val sql = createSqlForPublishedDocuments(queryInfo, uuid)
        val orderBy =
            " GROUP BY document_wrapper.uuid, document_wrapper.id ORDER BY document_wrapper.uuid"

        log.debug("SQL for documents to be exported: ${sql + orderBy}")
        val nativeQuery = entityManager.createNativeQuery(sql + orderBy)
            .setParameter(1, queryInfo.catalogId)

        val result =
            nativeQuery
                .setHint(AvailableHints.HINT_READ_ONLY, true)
                .unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("id")
                .addScalar("type")
                .addScalar("parent_id")
                .addScalar("tags")
                .setFirstResult((paging.page - 1) * paging.pageSize)
                .setMaxResults(paging.pageSize)
                .resultList as List<Array<out Any?>>

        return result
            .map {
                IndexDocumentResult(it[0] as String, it[1] as Int, it[2] as String, it[3] as Int?, it[4] as Array<String>? ?: emptyArray())
            }
            .map {
                // FOLDERS do not have a published version
                val document =
                    if (it.type == "FOLDER") {
                        documentService.getDocumentByWrapperId(queryInfo.catalogId, it.wrapperId)
                    } else {
                        documentService.getLastPublishedDocument(queryInfo.catalogId, it.uuid)
                    }
                DocumentIndexInfo(
                    document.apply {
                        wrapperId = it.wrapperId
                        if (it.parentId != null) {
                            val parentWrapper = documentService.getWrapperById(it.parentId)
                            // TODO AW: remove parent from data and make available for export in another way
                            data.put(FIELD_PARENT, parentWrapper.uuid)
                        }
                    },
                    it.tags.toList(),
                )
            }
    }

    private fun createSqlForPublishedDocuments(
        queryInfo: QueryInfo,
        uuid: String?,
    ): String {
        val iBusConditions = getSystemSpecificConditions(queryInfo.types)
        var sql =
            """
                SELECT document_wrapper.uuid, document_wrapper.id, document_wrapper.type, document_wrapper.parent_id, document_wrapper.tags
                FROM document_wrapper JOIN document document ON document_wrapper.uuid=document.uuid, catalog
                WHERE document_wrapper.catalog_id = catalog.id AND document.catalog_id = catalog.id AND 
                category = '${queryInfo.category}' AND deleted = 0 AND catalog.identifier = ? AND
                 $iBusConditions AND (${queryInfo.exporterConditions})
            """.trimIndent()
        uuid?.let { sql += " AND document_wrapper.uuid = '$it'" }
        return sql
    }

    fun getNumberOfPublishableDocuments(queryInfo: QueryInfo): Long {
        val sql =
            createSqlForPublishedDocuments(
                queryInfo,
                null,
            )
        val regex = Regex("(.|\\n)*?\\bFROM\\b")
        val countSql = sql.replaceFirst(regex, "SELECT COUNT(DISTINCT(document_wrapper.uuid, document_wrapper.id)) FROM")
        val nativeQuery = entityManager.createNativeQuery(countSql)

        nativeQuery.setParameter(1, queryInfo.catalogId)

        return (nativeQuery.singleResult as Number).toLong()
    }
}

data class IndexDocumentResult(
    val uuid: String,
    val wrapperId: Int,
    val type: String,
    val parentId: Int?,
    val tags: Array<String>,
)
