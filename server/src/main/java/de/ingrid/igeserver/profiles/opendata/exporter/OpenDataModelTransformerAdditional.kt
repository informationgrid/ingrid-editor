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

class OpenDataModelTransformerAdditional(val doc: Document, val codelistHandler: CodelistHandler, val catalogId: String, val config: Config) {
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

    private fun getDownloadLink(dist: JsonNode, uuid: String): String {
        return if (dist.getBoolean("link.asLink") == true) dist.getString("link.uri")  ?: ""// TODO encode uri
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