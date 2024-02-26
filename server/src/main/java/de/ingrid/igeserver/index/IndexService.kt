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
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ExportConfig
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import jakarta.persistence.EntityManager
import java.text.SimpleDateFormat
import java.util.*
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.jpa.AvailableHints
import org.hibernate.query.NativeQuery
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

data class DocumentIndexInfo(
    val document: Document,
    var exporterType: String? = null
)

data class QueryInfo(
    val catalogId: String,
    val category: String,
    val types: List<String>,
    val catalogProfile: CatalogProfile
)

@Service
class IndexService(
    private val catalogRepo: CatalogRepository,
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val entityManager: EntityManager,
    private val generalProperties: GeneralProperties
) {

    private val log = logger()

    companion object {
        fun getNextIndexName(name: String, uuid: String, uuidName: String): String {
            val uuidNameFinal = uuidName.lowercase(Locale.getDefault())
            var isNew = false

            val dateFormat = SimpleDateFormat("yyyyMMddHHmmssS")

            val delimiterPos: Int = name.lastIndexOf("_")
            if (delimiterPos == -1) {
                isNew = true
            } else {
                try {
                    dateFormat.parse(name.substring(delimiterPos + 1))
                } catch (ex: Exception) {
                    isNew = true
                }
            }

            val date: String = dateFormat.format(Date())

            if (isNew) {
                if (!name.contains(uuid)) {
                    return name + "@" + uuidNameFinal + "-" + uuid + "_" + date
                }
                return name + "_" + date
            } else {
                if (!name.contains(uuid)) {
                    return name.substring(0, delimiterPos) +
                        "@" +
                        uuidNameFinal +
                        "-" +
                        uuid +
                        "_" +
                        date
                }
                return name.substring(0, delimiterPos + 1) + date
            }
        }
    }

    fun getSinglePublishedDocument(
        catalogId: String,
        category: String,
        types: List<String>,
        catalogProfile: CatalogProfile,
        uuid: String
    ): DocumentIndexInfo {
        val docs = requestPublishableDocuments(catalogId, category, types, uuid, catalogProfile)
        return docs.single()
    }

    fun getPublishedDocuments(queryInfo: QueryInfo, currentPage: Int = 0): Page<DocumentIndexInfo> {
        val docs =
            requestPublishableDocuments(
                queryInfo.catalogId,
                queryInfo.category,
                queryInfo.types,
                null,
                queryInfo.catalogProfile,
                ResearchPaging(currentPage + 1, generalProperties.indexPageSize)
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
        catalogRepo
            .findByIdentifier(catalogId)
            .apply { settings.indexCronPattern = config.cronPattern }
            .run { catalogRepo.save(this) }
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
        catalogId: String,
        category: String,
        types: List<String>,
        uuid: String?,
        profile: CatalogProfile,
        paging: ResearchPaging = ResearchPaging(pageSize = generalProperties.indexPageSize)
    ): List<DocumentIndexInfo> {
        val iBusConditions = getSystemSpecificConditions(types)
        val sql = createSqlForPublishedDocuments(profile, catalogId, iBusConditions, category, uuid)
        val orderBy =
            " GROUP BY document_wrapper.uuid, document_wrapper.id ORDER BY document_wrapper.uuid"

        val nativeQuery = entityManager.createNativeQuery(sql + orderBy)

        nativeQuery.setParameter(1, catalogId)

        val result =
            nativeQuery
                .setHint(AvailableHints.HINT_READ_ONLY, true)
                .unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("id")
                .addScalar("type")
                .addScalar("parent_id")
                .setFirstResult((paging.page - 1) * paging.pageSize)
                .setMaxResults(paging.pageSize)
                .resultList as List<Array<out Any?>>

        return result
            .map {
                IndexDocumentResult(it[0] as String, it[1] as Int, it[2] as String, it[3] as Int?)
            }
            .map {
                // FOLDERS do not have a published version
                val document =
                    if (it.type == "FOLDER") {
                        documentService.getDocumentByWrapperId(catalogId, it.wrapperId)
                    } else {
                        documentService.getLastPublishedDocument(catalogId, it.uuid)
                    }
                DocumentIndexInfo(
                    document.apply {
                        wrapperId = it.wrapperId
                        if (it.parentId != null) {
                            val parentWrapper = documentService.getWrapperByDocumentId(it.parentId)
                            data.put(FIELD_PARENT, parentWrapper.uuid)
                        }
                    }
                )
            }
    }

    private fun createSqlForPublishedDocuments(
        profile: CatalogProfile,
        catalogId: String,
        iBusConditions: String,
        category: String,
        uuid: String?
    ): String {
        val profileConditions = profile.additionalPublishConditions(catalogId)

        val indexFolders = """OR (document1.type = 'FOLDER' AND document1.state = 'DRAFT')"""
        var sql =
            """
                SELECT document_wrapper.uuid, document_wrapper.id, document_wrapper.type, document_wrapper.parent_id
                FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid, catalog
                WHERE document_wrapper.catalog_id = catalog.id AND document1.catalog_id = catalog.id AND category = '$category' AND (document1.state = 'PUBLISHED' $indexFolders) AND deleted = 0 AND catalog.identifier = ? AND 
                (${iBusConditions})
            """
                .trimIndent()
        uuid?.let { sql += " AND document_wrapper.uuid = '$it'" }
        if (profileConditions.isNotEmpty())
            sql += " AND (${profileConditions.joinToString(" AND ")})"
        return sql
    }

    fun getNumberOfPublishableDocuments(queryInfo: QueryInfo): Long {
        val iBusConditions = getSystemSpecificConditions(queryInfo.types)
        val sql =
            createSqlForPublishedDocuments(
                queryInfo.catalogProfile,
                queryInfo.catalogId,
                iBusConditions,
                queryInfo.category,
                null
            )
        val regex = Regex("(.|\\n)*?\\bFROM\\b")
        val countSql = sql.replaceFirst(regex, "SELECT COUNT(*) FROM")
        val nativeQuery = entityManager.createNativeQuery(countSql)

        nativeQuery.setParameter(1, queryInfo.catalogId)

        return (nativeQuery.singleResult as Number).toLong()
    }

    fun getIndexIdentifier(elasticsearchAlias: String, category: DocumentCategory) =
        "${elasticsearchAlias}_${category.value}"
}

data class IndexDocumentResult(
    val uuid: String,
    val wrapperId: Int,
    val type: String,
    val parentId: Int?
)
