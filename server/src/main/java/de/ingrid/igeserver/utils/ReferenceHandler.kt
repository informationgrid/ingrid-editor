package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.messaging.UrlReport
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import java.time.LocalDate
import java.time.format.DateTimeFormatter

abstract class ReferenceHandler(val entityManager: EntityManager) {

    val log = logger()

    abstract fun getURLsFromCatalog(catalogId: String): List<DocumentLinks>

    abstract fun getProfile(): String

    open fun replaceUrl(catalogId: String, source: UrlReport, replaceUrl: String): Int {
        val query = replaceUrlSql.format(source.url, replaceUrl)
//        val queryCount = countReplaceUrlSql.format(source.url)
        var updatedDocs = 0

        source.datasets.forEach { doc ->
            // there should be something to be updated unless the information is deprecated
            val count = entityManager.createNativeQuery(countReplaceUrlSql)
                .unwrap(NativeQuery::class.java)
                .setParameter("catalogId", catalogId)
                .setParameter("uuid", doc.uuid)
                .setParameter("uri", source.url)
                .resultList.size

            log.debug("count: $count")

            if (count > 0) {
                // result does not really return the updated documents!
                entityManager.createNativeQuery(query)
                    .setParameter("catalogId", catalogId)
                    .setParameter("uuid", doc.uuid)
                    .executeUpdate()

                updatedDocs += count
            }
        }
        log.debug("documents updated with replaced URL: $updatedDocs")
        return updatedDocs
    }

    protected fun queryDocs(
        sql: String,
        jsonbField: String,
        filterByDocId: Int?,
        catalogId: String? = null,
        extraJsonbFields : Array<String>?  = null

    ): List<Array<Any?>> {
        var query = if (filterByDocId == null) sql else "$sql AND doc.id = $filterByDocId"
        if (catalogId != null) query = "$sql AND catalog.identifier = '$catalogId'"

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

    private val replaceUrlSql = """
        UPDATE document doc
        SET data = replace(doc.data\:\:text, '"uri": "%s"', '"uri": "%s"')\:\:jsonb
        FROM document_wrapper dw, catalog cat
        WHERE dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
          AND dw.catalog_id = cat.id 
          AND doc.catalog_id = cat.id
          AND dw.deleted = 0
          AND cat.identifier = :catalogId 
          AND dw.uuid = :uuid
    """.trimIndent()

    private val countReplaceUrlSql = """
        SELECT doc.id
        FROM document doc, document_wrapper dw, catalog cat
        WHERE dw.uuid = doc.uuid 
        AND doc.state != 'ARCHIVED' 
        AND dw.catalog_id = cat.id
        AND dw.deleted = 0
        AND cat.identifier = :catalogId 
        AND dw.uuid = :uuid
        AND doc.data\:\:text ilike CONCAT('%"uri"\: "',:uri, '"%')
     """.trimIndent()
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