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
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.AddressTransformerConfig
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import java.time.OffsetDateTime
import java.time.ZoneId

class OpenDataRDFTransformer(
    val transformerConfig: OpenDataTransformerConfig,
    val appUrl: String,
    documentsUrl: String,
) {
    val addressExporter = AddressExport(transformerConfig)
    val catalogId = transformerConfig.catalogIdentifier
    val codelistTransformer = transformerConfig.codelists
    val uploadConfig = transformerConfig.uploadConfig
    val documentService = transformerConfig.documentService
    val tags = transformerConfig.tags
    val doc = transformerConfig.doc

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun getRDF(): String {
        val self = this

        return XMLStringOutput2().apply {
            templateEngine.render(
                "export/opendata/rdf-export.jte",
                mapOf(
                    "map" to mapOf(
                        "model" to self,
//                        "catalog" to catalogService.getCatalogById(catalogId),
                    ),
                ),
                this,
            )
        }.toString()
    }

    val uuid = doc.uuid
    val title = doc.title
    val issued = doc.created.toString()
    val modified = doc.modified.toString()
    val description = doc.data.getStringOrEmpty("description")
    val landingPage = doc.data.getStringOrEmpty("landingPage")
    val catalog = transformerConfig.catalogService.getCatalogById(transformerConfig.catalogIdentifier)
    val catalogDescription = catalog.description
    val catalogTitle = catalog.name
    val uploadUrl = "$documentsUrl$catalogId/${doc.uuid}"
    val themes = doc.data.get("DCATThemes")?.values()?.map {
        "http://publications.europa.eu/resource/authority/data-theme/" +
            codelistTransformer.getData("6400", it.getStringOrEmpty("key"))
    } ?: emptyList()

    val keywords = (doc.data.get("keywords")?.values()?.map { it.asString() } ?: emptyList())

    val qualityProcessURI = doc.data.getStringOrEmpty("qualityProcessURI")
    val accrualPeriodicity = doc.data.getString("accrualPeriodicity.key")
        ?.let { mapPeriodicity(it) }
        ?.let { "http://publications.europa.eu/resource/authority/frequency/$it" }

    private fun mapPeriodicity(key: String): String? = when (key) {
        "1" -> "CONT"
        "2" -> "DAILY"
        "3" -> "WEEKLY"
        "4" -> "BIWEEKLY"
        "5" -> "MONTHLY"
        "6" -> "QUARTERLY"
        "7" -> "ANNUAL_2"
        "8" -> "ANNUAL"
        "9" -> "AS_NEEDED"
        "10" -> "IRREG"
        "11" -> "NOT_PLANNED"
        "12" -> "UNKNOWN"
        else -> null
    }

    val temporalResolution = doc.data.get("userDefinedAccrualPeriodicity")?.let {
        val number = it.get("number")?.asString()?.toIntOrNull()
        val unit = it.get("unit")?.get("key")?.asString()
        if (number != null && unit != null) {
            when (unit) {
                "1" -> "PT${number}S"
                "2" -> "PT${number}M"
                "3" -> "PT${number}H"
                "4" -> "P${number}D"
                "5" -> "P${number}M"
                "6" -> "P${number}Y"
                else -> null
            }
        } else {
            null
        }
    }

    fun getTemporal(): SimpleTemporal? {
        val type = doc.data.getString("temporal.data.type")
        if (type == "none") return null

        val temporalStart = (
            doc.data.getString("temporal.data.resourceRange.start")
                ?: doc.data.getString("temporal.data.resourceDate")
            )?.let {
            OffsetDateTime.parse(it).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate().toString()
        } ?: ""
        val temporalEnd = (
            doc.data.getString("temporal.data.resourceRange.end")
                ?: doc.data.getString("temporal.data.resourceDate")
            )?.let {
            OffsetDateTime.parse(it).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate().toString()
        } ?: ""
        return SimpleTemporal(temporalStart, temporalEnd)
    }

    val legalBasis = doc.data.getStringOrEmpty("legalBasis")
    var politicalGeocodingLevelKey: String? = doc.data.getString("politicalGeocodingLevel.key")

    val publisher = mapAddress("10")
    val creator = mapAddress("11")
    val pointOfContact = mapAddress("7")
    val originator = mapAddress("6")
    val maintainer = mapAddress("2")

    private fun mapAddress(type: String): AddressModelTransformer? {
        val addressUuid = doc.data.get("addresses")?.values()?.find { it.getString("type.key") == type }?.getStringOrEmpty("ref")
        return getAddress(addressUuid)
    }

    private fun getAddress(uuid: String?): AddressModelTransformer? {
        if (uuid.isNullOrBlank()) return null
        val doc = documentService.getLastPublishedDocument(catalogId, uuid)
        // TODO: handle tags
        return AddressModelTransformer(
            AddressTransformerConfig(
                catalogId,
                codelistTransformer,
                null,
                doc,
                documentService,
                uploadConfig,
                emptyList(),
            ),
        )
    }

    val spatials: List<SpatialModel> = doc.data.get("spatial")?.values()?.map { spatial ->
        SpatialModel(
            type = spatial.getStringOrEmpty("type"),
            title = spatial.getStringOrEmpty("title"),
            value = spatial.get("value")?.let {
                SpatialModel.BoundingBoxModel(
                    lat1 = it.get("lat1")?.asDouble() ?: 0.0,
                    lon1 = it.get("lon1")?.asDouble() ?: 0.0,
                    lat2 = it.get("lat2")?.asDouble() ?: 0.0,
                    lon2 = it.get("lon2")?.asDouble() ?: 0.0,
                )
            },
            wkt = spatial.getStringOrEmpty("wkt"),
            ars = spatial.getStringOrEmpty("ars"),
        )
    } ?: emptyList()

    val distributions: List<Distribution> = doc.data.get("distributions")?.values()?.map { dist ->
        val isLink = dist.getBoolean("link.asLink") ?: false
        val accessURL = if (isLink) dist.getStringOrEmpty("link.uri") else uploadUrl + "/" + dist.getString("link.uri")
        Distribution(
            accessURL = accessURL,
            format = dist.getStringOrEmpty("format.key"),
            title = dist.getStringOrEmpty("title"),
            modified = dist.getStringOrEmpty("modified"),
            description = dist.getStringOrEmpty("description"),
            license = dist.get("license")?.let {
                License(
                    it.getStringOrEmpty("key"),
                    codelistTransformer.getValue("20004", KeyValue(it.getStringOrEmpty("key"))) ?: "",
                )
            },
            byClause = dist.getStringOrEmpty("byClause"),
            languages = dist.get("languages")?.values()?.map { it.getStringOrEmpty("key") } ?: emptyList(),
            availability = dist.getStringOrEmpty("availability.key"),
        )
    } ?: emptyList()
}

private class XMLStringOutput2 : StringOutput() {
    override fun writeUserContent(value: String?) {
        if (value == null) return
        super.writeUserContent(
            StringEscapeUtils.escapeXml10(value),
//                .replace("\n", "&#10;")
//                .replace("\r", "&#13;")
//                .replace("\t", "&#9;")
        )
    }
}

data class SimpleTemporal(val start: String, val end: String)
