package de.ingrid.igeserver.utils

import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.query.NativeQuery
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager

abstract class ReferenceHandler(val entityManager: EntityManager) {

    val log = logger()

    abstract fun getURLsFromCatalog(catalogId: String): List<DocumentLinks>

    abstract fun getProfile(): String
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
