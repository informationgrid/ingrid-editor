/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import de.ingrid.igeserver.exporter.AddressExport
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.utils.convertBoundingBoxToGeoJson
import de.ingrid.igeserver.utils.convertWktToGeoJson
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

data class Keyword(
    val id: String?,
    val term: String,
    val source: String,
)

class OpenDataModelTransformer(
    val transformerConfig: OpenDataTransformerConfig,
) {
    val addressExporter = AddressExport(transformerConfig)
    val catalogId = transformerConfig.catalogIdentifier
    val codelistTransformer = transformerConfig.codelists
    val uploadConfig = transformerConfig.uploadConfig
    val documentService = transformerConfig.documentService
    val tags = transformerConfig.tags
    val doc = transformerConfig.doc

    fun getDistributions(): List<Distribution> = doc.data.get("distributions")?.map { dist ->
        Distribution(
            dist.getStringOrEmpty("format.key"),
            getDownloadLink(dist, doc.uuid),
            dist.getString("modified"),
            dist.getStringOrEmpty("title"),
            dist.getStringOrEmpty("description"),
            mapLicense(dist.getString("license.key")),
            dist.getStringOrEmpty("byClause"),
            dist.get("languages").mapNotNull { mapLanguage(it) },
            mapAvailability(dist.getStringOrEmpty("availability.key")),
        )
    } ?: emptyList()

    fun getHierarchyParent() = doc.data.getStringOrEmpty("_parent")
    fun getUuid() = doc.uuid
    fun getTitle() = doc.title?.trim() ?: ""
    fun getDescription() = doc.data.getStringOrEmpty("description")
    fun getLandingPage() = doc.data.getStringOrEmpty("landingPage")
    fun getThemes() = doc.data.get("DCATThemes")?.mapNotNull {
        val key = it.getStringOrEmpty("key")
        Keyword(
            key,
            codelistTransformer.codelistHandler.getCodelistValue("6400", key) ?: "???",
            "THEMES",
        )
    } ?: emptyList()

    fun getFreeKeywords() = doc.data.get("keywords")?.mapNotNull {
        Keyword(null, it.asText(), "FREE")
    } ?: emptyList()

    fun getCreated() = doc.created.toString()
    fun getModified() = doc.modified.toString()
    val periodicityKey = doc.data.getString("accrualPeriodicity.key")
    fun getPeriodicity() = periodicityKey?.let { codelistTransformer.getValue("518", KeyValue(it)) } ?: ""
    fun getKeywords(): List<Keyword> = getThemes() + getFreeKeywords()
    fun getAddresses() = doc.data.get("addresses").mapNotNull {
        addressExporter.toAddressModelTransformer(
            AddressRefModel(
                KeyValue(it.getString("type.key")),
                it.getString("ref"),
            ),
        )
    }

    fun mapAddressType(typeKey: String): String = when (typeKey) {
        "2" -> "maintainer"
        "6" -> "originator"
        "7" -> "contactPoint"
        "10" -> "publisher"
        "11" -> "creator"
        else -> "???"
    }

    fun mapCommunicationTyp(type: String): String = when (type) {
        "1" -> "tel"
        "2" -> "fax"
        "3" -> "email"
        "4" -> "url"
        else -> "???"
    }

    fun getSpatials(): List<String> = doc.data.get("spatial")?.mapNotNull { spatial ->
        val type = spatial.getString("type")
        when (type) {
            "free" -> convertBoundingBoxToGeoJson(getBoundingBox(spatial.get("value")))
            "wkt" -> convertWktToGeoJson(spatial.getString("wkt")!!)
            "wfsgnde" -> convertBoundingBoxToGeoJson(getBoundingBox(spatial.get("value")))
            else -> null
        }
    } ?: emptyList()

    private fun getBoundingBox(node: JsonNode) = SpatialModel.BoundingBoxModel(
        node.get("lat1").asDouble(),
        node.get("lon1").asDouble(),
        node.get("lat2").asDouble(),
        node.get("lon2").asDouble(),
    )
    fun getSpatialTitles() = doc.data.get("spatial")?.map { it.getStringOrEmpty("title") } ?: emptyList()
    fun getArs() = doc.data.get("spatial")?.map { it.getStringOrEmpty("ars") } ?: emptyList()
    fun getLegalBasis() = doc.data.getStringOrEmpty("legalBasis")
    fun getQualityProcessURI() = doc.data.getStringOrEmpty("qualityProcessURI")
    fun getPoliticalGeocodingLevel() = doc.data.getString("politicalGeocodingLevel.key")
        ?.let { codelistTransformer.getCatalogCodelistValue("20006", KeyValue(it)) }
    private val resourceDateRange = doc.data.getPath("temporal.data.resourceRange")
    private val resourceDate = doc.data.getString("temporal.data.resourceDate")
    fun getTemporalStart(): String? = if (resourceDateRange != null) {
        resourceDateRange.getString("start")
    } else {
        if (doc.data.getString("temporal.data.type") == "at" || doc.data.getString("temporal.data.intervalFrom") == "date") {
            resourceDate
        } else {
            null
        }
    }

    fun getTemporalEnd(): String? = if (resourceDateRange != null) {
        resourceDateRange.getString("end")
    } else {
        if (doc.data.getString("temporal.data.type") == "at" || doc.data.getString("temporal.data.intervalTo") == "date") {
            resourceDate
        } else {
            null
        }
    }

    private fun getDownloadLink(dist: JsonNode, uuid: String): String = if (dist.getBoolean("link.asLink") == true) {
        dist.getStringOrEmpty("link.uri") // TODO encode uri
    } else {
        "${uploadConfig.uploadExternalUrl}$catalogId/$uuid/${dist.getString("link.uri")}"
    }

    private fun mapAvailability(key: String?): String {
        if (key == null) return ""
        return codelistTransformer.getCatalogCodelistValue("20005", KeyValue(key)) ?: ""
    }

    private fun mapLicense(licenseKey: String?): License? {
        if (licenseKey.isNullOrEmpty()) return null
        val value = codelistTransformer.getCatalogCodelistValue("20004", KeyValue(licenseKey))
        return License(licenseKey, value!!)
    }

    private fun mapLanguage(it: JsonNode): String? = codelistTransformer.getCatalogCodelistValue("20007", KeyValue(it.getString("key")!!))
}
