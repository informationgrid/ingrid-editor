package de.ingrid.igeserver.profiles.ingrid_bmwk.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class BMWKModelTransformer(val doc: Document, val codelistHandler: CodelistHandler, val catalogId: String) {
    fun getDistributions(): List<Distribution> {
        return doc.data.get("distributions")?.map { dist ->
            Distribution(
                dist.getStringOrEmpty("format.key"),
                dist.getStringOrEmpty("link.uri"),
                dist.getStringOrEmpty("modified"),
                dist.getStringOrEmpty("title"),
                dist.getStringOrEmpty("description"),
                mapLicense(dist.getString("license.key")),
                dist.getStringOrEmpty("byClause"),
                dist.get("languages").mapNotNull { mapLanguage(it) },
                mapAvailability(dist.getStringOrEmpty("availability.key"))
            )
        } ?: emptyList()
    }

    private fun mapAvailability(key: String?): String {
        if (key == null) return ""
        return codelistHandler.getCatalogCodelistValue(catalogId, "20005", key) ?: ""
    }

    private fun mapLicense(licenseKey: String?): License? {
        if (licenseKey.isNullOrEmpty()) return null
        val value = codelistHandler.getCatalogCodelistValue(catalogId, "20004", licenseKey)
        return License(licenseKey, value!!)
    }

    private fun mapLanguage(it: JsonNode): String? {
        return codelistHandler.getCatalogCodelistValue(catalogId, "20007", it.getString("key")!!)
    }
}

data class Distribution(
    val format: String,
    val accessURL: String,
    val modified: String,
    val title: String,
    val description: String,
    val license: License?,
    val byClause: String,
    val languages: List<String>,
    val availability: String
)

data class License(
    val url: String,
    val name: String
)