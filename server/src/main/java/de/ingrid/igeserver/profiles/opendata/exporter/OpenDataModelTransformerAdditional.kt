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
package de.ingrid.igeserver.profiles.opendata.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import de.ingrid.mdek.upload.Config

class OpenDataModelTransformerAdditional(
    val doc: Document,
    val codelistHandler: CodelistHandler,
    val catalogId: String,
    val config: Config
) {
    fun getDistributions(): List<Distribution> {
        return doc.data.get("distributions")?.map { dist ->
            Distribution(
                dist.getStringOrEmpty("format.key"),
                getDownloadLink(dist, doc.uuid),
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

    fun getUuid() = doc.uuid
    fun getTitle() = doc.title?.trim() ?: ""
    fun getDescription() = doc.data.getString("description") ?: ""
    fun getLandingPage() = doc.data.getString("alternateTitle") ?: ""
    fun getThemes() = doc.data.get("openDataCategories")?.mapNotNull {
        codelistHandler.getCodelistValue("6400", it.getString("key") ?: "")
    } ?: emptyList()

    fun getCreated() = doc.created.toString()
    fun getModified() = doc.modified.toString()
    fun getPeriodicity() = "" //doc.data.getmodified.toString()
    fun getKeywords() = emptyList<String>()
    fun getAddresses() = doc.data.get("pointOfContact").map {
        AddressInfo(
            mapAddressType(it.getString("type.key") ?: ""),
            it.getString("ref.organization") ?: "",
            emptyList()
        )
    }

    private fun mapAddressType(typeKey: String): String {
        return when (typeKey) {
            "2" -> return "maintainer"
            "6" -> return "originator"
            "7" -> return "contactPoint"
            "11" -> return "creator"
            "12" -> return "publisher"
            else -> return "???"
        }
    }

    fun getSpatials() = emptyList<String>()
    fun getSpatialTitles() = emptyList<String>()
    fun getArs() = emptyList<String>()
    fun getLegalBasis() = ""
    fun getQualityProcessURI() = ""
    fun getPoliticalGeocodingLevel() = ""
    fun getTemporalStart(): String? = null
    fun getTemporalEnd(): String? = null

    private fun getDownloadLink(dist: JsonNode, uuid: String): String {
        return if (dist.getBoolean("link.asLink") == true) dist.getString("link.uri") ?: ""// TODO encode uri
        else "${config.uploadExternalUrl}$catalogId/${uuid}/${dist.getString("link.uri")}"
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

data class AddressInfo(
    val type: String,
    val organisation: String,
    val contacts: List<String> = emptyList(),
)