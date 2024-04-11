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
package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.UrlReport
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import java.time.LocalDate
import java.time.format.DateTimeFormatter

abstract class ReferenceHandler(val entityManager: EntityManager) {

    val log = logger()

    abstract fun getURLsFromCatalog(catalogId: String, groupDocIds: List<Int>, profile: String): List<DocumentLinks>

    abstract fun getProfile(): String
    
    abstract val urlFields: List<String>

    open fun replaceUrl(catalogId: String, source: UrlReport, replaceUrl: String): Int {
        var updatedDocs = 0

        source.datasets.forEach { doc ->
            // there should be something to be updated unless the information is deprecated
            val count = getUrlCount(catalogId, doc, source, urlFields)
            if (count > 0) {
                urlFields.forEach {
                    doReplaceWithUrlField(it, catalogId, doc.uuid, source.url, replaceUrl)
                }
                updatedDocs += count
            }
        }
        log.debug("documents updated with replaced URL: $updatedDocs")
        return updatedDocs
    }

    private fun getUrlCount(
        catalogId: String,
        doc: DatasetInfo,
        source: UrlReport,
        urlFields: List<String>
    ) = entityManager.createNativeQuery(countReplaceUrlSql(urlFields))
        .unwrap(NativeQuery::class.java)
        .setParameter("catalogId", catalogId)
        .setParameter("uuid", doc.uuid)
        .setParameter("uri", source.url)
        .resultList.size

    private fun doReplaceWithUrlField(
        urlField: String,
        catalogId: String,
        uuid: String,
        sourceUrl: String,
        replaceUrl: String
    ) {
        val query = replaceUrlSql(urlField).format(sourceUrl, replaceUrl)
        entityManager.createNativeQuery(query)
            .setParameter("catalogId", catalogId)
            .setParameter("uuid", uuid)
            .executeUpdate()
    }

    protected fun queryDocs(
        sql: String,
        jsonbField: String,
        filterByDocId: Int?,
        catalogId: String? = null,
        extraJsonbFields: Array<String>? = null,
        groupDocIds: List<Int> = emptyList()
    ): List<Array<Any?>> {
        var query = if (filterByDocId == null) sql else "$sql AND doc.id = $filterByDocId"
        if (catalogId != null) query = "$sql AND catalog.identifier = '$catalogId'"

        if (groupDocIds.isNotEmpty()) {
            val groupDocIdsString = groupDocIds.joinToString(",")
            query += """ AND (dw.id = ANY(('{$groupDocIdsString}')) 
                            OR ('{$groupDocIdsString}') && dw.path)"""
        }

        @Suppress("UNCHECKED_CAST")
        return entityManager.createNativeQuery(query).unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("catalogId")
            .addScalar(jsonbField)
            .addScalar("title")
            .addScalar("type").apply {
                extraJsonbFields?.forEach { field ->
                    addScalar(field)
                }
            }.resultList as List<Array<Any?>>
    }

    private fun replaceUrlSql(urlField: String) = """
        UPDATE document doc
        SET data = replace(doc.data\:\:text, '"$urlField": "%s"', '"$urlField": "%s"')\:\:jsonb
        FROM document_wrapper dw, catalog cat
        WHERE dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
          AND dw.catalog_id = cat.id 
          AND doc.catalog_id = cat.id
          AND dw.deleted = 0
          AND cat.identifier = :catalogId 
          AND dw.uuid = :uuid
    """.trimIndent()

    private fun countReplaceUrlSql(urlFields: List<String>): String {
        return """
            SELECT doc.id
            FROM document doc, document_wrapper dw, catalog cat
            WHERE dw.uuid = doc.uuid 
            AND doc.state != 'ARCHIVED' 
            AND dw.catalog_id = cat.id
            AND doc.catalog_id = cat.id
            AND dw.deleted = 0
            AND cat.identifier = :catalogId 
            AND dw.uuid = :uuid
            AND (${urlFields.joinToString(" OR ") { """(doc.data\:\:text ilike CONCAT('%"$it"\: "',:uri, '"%'))""" }})
         """.trimIndent()
    }
}

data class DocumentLinks(
    val catalogId: String,
    val docUuid: String,
    val docs: MutableList<UploadInfo>,
    val title: String = "",
    val type: String = ""
) {
    fun getDocsByLatestValidUntilDate(): List<UploadInfo> {
        val response = mutableListOf<UploadInfo>()
        docs.forEach { doc ->
            val found = response.find { it.uri == doc.uri }
            if (found == null) response.add(doc)
            else {
                if (found.validUntil != null) {
                    val date1 = LocalDate.parse(found.validUntil, DateTimeFormatter.ISO_DATE_TIME)
                    val date2 = if (doc.validUntil == null) null else LocalDate.parse(
                        doc.validUntil,
                        DateTimeFormatter.ISO_DATE_TIME
                    )
                    if (date2 == null || date2.isAfter(date1)) {
                        response.remove(found)
                        response.add(doc)
                    }
                }
            }
        }
        return response
    }
}

data class UploadInfo(val fromField: String, val uri: String, val validUntil: String?)