package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.messaging.UrlReport
import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager

abstract class ReferenceHandler(val entityManager: EntityManager) {
    abstract fun getURLsFromCatalog(catalogId: String): List<DocumentLinks>

    abstract fun getProfile(): String

    open fun replaceUrl(catalogId: String, source: UrlReport, replaceUrl: String) {
        val targetUrl = replaceUrlSql.format(source.url, replaceUrl)

        source.datasets.forEach { doc ->
            entityManager.createNativeQuery(targetUrl)
                .setParameter("catalogId", catalogId)
                .setParameter("uuid", doc.uuid)
                .executeUpdate()
        }
    }

    private val replaceUrlSql = """
        UPDATE document doc
        SET data = replace(doc.data\:\:text, '"uri": "%s"', '"uri": "%s"')\:\:jsonb
        FROM document_wrapper dw, catalog cat
        WHERE dw.published = doc.id AND dw.catalog_id = cat.id AND cat.identifier = :catalogId AND dw.uuid = :uuid
    """.trimIndent()
}

data class DocumentLinks(
    val catalogId: String,
    val docUuid: String,
    val docs: List<UvpReferenceHandler.UploadInfo>,
    val title: String = "",
    val type: String = ""
) {
    fun getDocsByLatestValidUntilDate(): List<UvpReferenceHandler.UploadInfo> {
        val response = mutableListOf<UvpReferenceHandler.UploadInfo>()
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
