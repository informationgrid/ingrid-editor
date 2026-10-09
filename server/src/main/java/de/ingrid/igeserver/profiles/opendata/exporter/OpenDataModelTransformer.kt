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

import de.ingrid.igeserver.exporter.AddressExport
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneAdministrative
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneCommunication
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneContact
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDataTemporal
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDatasource
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDateRange
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDcat
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDocumentOpenData
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneKeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneKeyword
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneMetadata
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneSpatial
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneTemporal
import de.ingrid.igeserver.utils.convertBoundingBoxToGeoJson
import de.ingrid.igeserver.utils.convertWktToGeoJson
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import tools.jackson.databind.JsonNode

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
    val contentField: MutableList<String> = mutableListOf()

    fun getDistributions(): List<Distribution> = doc.data.get("distributions")?.values()?.map { dist ->
        val licenseKey = dist.getString("license.key")
        val byClause = dist.getStringOrEmpty("byClause")
        val languages = dist.get("languages")?.values()?.mapNotNull { mapLanguage(it) } ?: emptyList()
        Distribution(
            format = dist.getStringOrEmpty("format.key"),
            accessURL = getDownloadLink(dist, doc.uuid),
            modified = dist.getString("modified"),
            title = dist.getStringOrEmpty("title"),
            description = dist.getStringOrEmpty("description"),
            license = mapLicense(licenseKey, byClause, languages),
            availability = mapAvailability(dist.getStringOrEmpty("availability.key")),
        )
    } ?: emptyList()

    fun getHierarchyParent() = doc.data.getStringOrEmpty("_parent")
    fun getUuid() = doc.uuid
    fun getTitle() = doc.title?.trim() ?: ""
    fun getDescription() = doc.data.getStringOrEmpty("description")
    fun getLandingPage() = doc.data.getStringOrEmpty("landingPage")
    fun getThemes() = doc.data.get("DCATThemes")?.values()?.mapNotNull {
        val key = it.getStringOrEmpty("key")
        Keyword(
            key,
            codelistTransformer.codelistHandler.getCodelistValue("6400", key) ?: "???",
            "THEMES",
        )
    } ?: emptyList()

    fun getFreeKeywords() = doc.data.get("keywords")?.values()?.mapNotNull {
        Keyword(null, it.asString(), "FREE")
    } ?: emptyList()

    fun getCreated() = doc.created.toString()
    fun getModified() = doc.modified.toString()
    val periodicityKey = doc.data.getString("accrualPeriodicity.key")
    fun getPeriodicity() = periodicityKey?.let { codelistTransformer.getValue("518", KeyValue(it)) } ?: ""
    fun getKeywords(): List<Keyword> = getThemes() + getFreeKeywords() + handleOpendataKeyword()
    private fun handleOpendataKeyword(): List<Keyword> {
        val flexOpenData = transformerConfig.flexOpenData
        val isOpendata = doc.data.getBoolean("properties.isOpenData")
        return if (!flexOpenData || isOpendata == true) {
            listOf(Keyword(null, "opendata", "FREE"))
        } else {
            emptyList()
        }
    }

    fun getAddresses() = doc.data.get("addresses")?.values()?.mapNotNull {
        addressExporter.toAddressModelTransformer(
            AddressRefModel(
                KeyValue(it.getString("type.key")),
                it.getString("ref"),
            ),
        )
    } ?: emptyList()

    fun mapAddressType(typeKey: String?): String = when (typeKey) {
        "2" -> "maintainer"
        "6" -> "originator"
        "7" -> "contactPoint"
        "10" -> "publisher"
        "11" -> "creator"
        else -> "???"
    }

    fun mapCommunicationTyp(type: String?): String = when (type) {
        "1" -> "tel"
        "2" -> "fax"
        "3" -> "email"
        "4" -> "url"
        else -> "???"
    }

    fun getSpatials(): List<LuceneSpatial> = doc.data.get("spatial")?.values()?.mapNotNull { spatial ->
        val type = spatial.getString("type")
        val title = spatial.getString("title")?.takeIf { it.isNotBlank() }
        val ars = spatial.getString("ars")?.takeIf { it.isNotBlank() }
        val administrative = ars?.let { LuceneAdministrative(it) }
        val valueNode = spatial.get("value")
        val bboxModel = if (valueNode != null && valueNode.has("lat1") && valueNode.has("lon1") && valueNode.has("lat2") && valueNode.has("lon2")) {
            getBoundingBox(valueNode)
        } else {
            null
        }
        val bboxList = bboxModel?.let { listOf(it.lon1, it.lat1, it.lon2, it.lat2) }
        val wktStr = spatial.getString("wkt")?.takeIf { it.isNotBlank() }

        val geoJson = when (type) {
            "free" -> bboxModel?.let { convertBoundingBoxToGeoJson(it) }
            "wkt" -> wktStr?.let { convertWktToGeoJson(it) }
            "wfsgnde" -> bboxModel?.let { convertBoundingBoxToGeoJson(it) }
            else -> null
        }

        LuceneSpatial(
            name = title,
            bbox = bboxList,
            wkt = wktStr,
            toponym = null,
            administrative = administrative,
            geometry = geoJson,
        )
    } ?: emptyList()

    private fun getBoundingBox(node: JsonNode) = SpatialModel.BoundingBoxModel(
        node.get("lat1").asDouble(),
        node.get("lon1").asDouble(),
        node.get("lat2").asDouble(),
        node.get("lon2").asDouble(),
    )

    fun getSpatialTitles(): List<String> = doc.data.get("spatial")?.values()?.map { it.getStringOrEmpty("title") } ?: emptyList()

    fun getArs(): List<String> = doc.data.get("spatial")?.values()?.map { it.getStringOrEmpty("ars") } ?: emptyList()
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

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
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

    private fun mapLicense(licenseKey: String?, byClause: String = "", languages: List<String> = emptyList()): License? {
        if (licenseKey.isNullOrEmpty()) return null
        val value = codelistTransformer.getCatalogCodelistValue("20004", KeyValue(licenseKey))
        return License(
            url = licenseKey,
            name = value ?: "",
            attributionByText = byClause.takeIf { it.isNotBlank() },
            languages = languages,
        )
    }

    private fun mapLanguage(it: JsonNode): String? = codelistTransformer.getCatalogCodelistValue("20007", KeyValue(it.getString("key")!!))

    fun toLuceneDocument(
        catalog: Catalog,
        partner: String,
        provider: String,
    ): LuceneDocumentOpenData {
        val langKey = catalog.settings.config.language
        val langValue = langKey?.let { codelistTransformer.getCatalogCodelistValue("20007", KeyValue(it)) } ?: langKey
        val metadataLanguage = langKey?.let { LuceneKeyValue(it, langValue) }
        val temporalStart = getTemporalStart()
        val temporalEnd = getTemporalEnd()

        return LuceneDocumentOpenData(
            id = handleContent(getUuid()),
            schema = "https://schema.ingrid-oss.eu/index/draft/schema/index-opendata.json",
            metadata = LuceneMetadata(
                dataType = "OPENDATA",
                created = getCreated(),
                modified = getModified(),
                issued = null,
                partner = partner,
                provider = provider,
                language = metadataLanguage,
                datasource = LuceneDatasource(
                    id = catalog.identifier,
                    name = catalog.name,
                ),
            ),
            title = getTitle(),
            description = getDescription(),
            spatials = getSpatials(),
            temporal = LuceneTemporal(
                dataTemporal = if (temporalStart != null || temporalEnd != null) {
                    listOf(
                        LuceneDataTemporal(
//                            dateType = "created",
                            dateRange = LuceneDateRange(
                                gte = temporalStart,
                                lte = temporalEnd,
                            ),
                        ),
                    )
                } else {
                    emptyList()
                },
            ),
            keywords = getKeywords().map { keyword ->
                LuceneKeyword(
                    term = keyword.term,
                    id = keyword.id,
                    source = keyword.source,
                )
            },
            references = emptyList(),
            sortUuid = "",
            contacts = getAddresses().map { address ->
                LuceneContact(
                    role = address.relationType?.value ?: address.relationType?.key,
                    name = address.title,
                    communications = address.allCommunications.map {
                        LuceneCommunication(type = it.key, value = it.value)
                    },
                    street = address.street,
                    code = address.zipCode,
                    pocode = address.zipPoBox,
                    locality = address.city,
                    country = address.countryIso3166 ?: address.countryKey,
                    administrativeArea = address.administrativeArea,
                )
            },
            distributions = getDistributions(),
            dcat = getLandingPage().takeIf { it.isNotBlank() }?.let { LuceneDcat(it) },
            legalBasis = getLegalBasis().takeIf { it.isNotBlank() },
            politicalGeocodingLevelURI = getPoliticalGeocodingLevel(),
            fulltext = contentField,
        )
    }
}
