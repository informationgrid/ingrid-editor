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
package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.exports.interfaces.dcat.DCAT
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import org.json.simple.parser.JSONParser
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@JsonIgnoreProperties(ignoreUnknown = true)
data class MCloudModel(
    @JsonProperty("_uuid") override val uuid: String,
    override val title: String,
    override val description: String?,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _contentModified: OffsetDateTime,
    override val distributions: List<DownloadModel>?,
    override val license: String?,
) : DCAT {

    override val publisher: String?
        get() {
            return data.addresses
                ?.firstOrNull { it.type?.key == "10" }
                ?.ref
        }

    val hasSingleSpatial: Boolean
        get() = realSpatials?.size == 1

    val spatialTitels: List<String>?
        get() = data.spatials?.map { it.title }?.filterNotNull()

    val realSpatials: List<SpatialModel>?
        get() {
            return data.spatials?.filter { it.type == "free" || it.type == "wkt" }
        }

    val allData: List<String>?
        get() {
            if (data.mfundFKZ != null || data.mfundProject != null) {
                val result = mutableListOf("mfund")
                if (data.mfundFKZ != null) {
                    result.add("mFUND-FKZ: $data.mfundFKZ")
                }
                if (data.mfundProject != null) {
                    result.add("mFUND-Projekt: $data.mfundProject")
                }
                return result
            }
            return null
        }

    fun getThemes(): List<String> {
        if (data.DCATThemes == null) return emptyList()
        return data.DCATThemes
            .map { "http://publications.europa.eu/resource/authority/data-theme/$it" }
    }


    companion object {
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }
    fun getLicenseData(): Any? {
        if(data.license != null) {
            var jsonString = "{\"id\":\""+data.license.key+"\",\"name\":\""+data.license.value+"\"}";
            // either use key or if no key search for value
            val entryID = data.license.key ?: codeListService?.getCodeListEntryId("6500", data.license.value, "de")
            if(entryID != null) {
                val codeListEntry = codeListService?.getCodeListEntry("6500", entryID)
                if(!codeListEntry?.data.isNullOrEmpty()) {
                    jsonString = codeListEntry?.data.toString();
                } else if(codeListEntry?.getField("de") != null) {
                    jsonString = "{\"id\":\""+data.license.key+"\",\"name\":\""+codeListEntry.getField("de")+"\"}";
                }
            }
            return if (jsonString.isEmpty()) null else JSONParser().parse(jsonString)
        }
        return null
    }

    val periodicity: String?
    get(){
        val timePeriod = codeListService?.getCodeListValue("518", data.periodicity?.key, "en")

        when(timePeriod){
            "continual" -> return "CONT"
            "daily" -> return "DAILY"
            "weekly" -> return "WEEKLY"
            "fortnightly" -> return "BIWEEKLY"
            "monthly" -> return "MONTHLY"
            "quarterly" -> return "QUARTERLY"
            "biannually" -> return "BIENNIAL"
            "annually" -> return "ANNUAL"
            "as Needed" -> return "IRREG"
            "irregular" -> return "IRREG"
            "not Planned" -> return "NEVER"
            "unknown" -> return "UNKNOWN"
        }
        return null
    }

    fun getCodelistValue(catalogId: String, codelistId: String, key: String?, value: String?): String {
        return if (key == null) value ?: ""
        else {
            val codelistValue = codelistHandler?.getCatalogCodelistValue(catalogId, codelistId, key)
            if (codelistValue == null) {
                // TODO: use logger
                println("Codelist-Value not found for '${key}' in list '${codelistId}'")
            }
            codelistValue ?: ""
        }
    }

    fun isValid(): Boolean {
        // TODO: implement
        return true
    }

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val modified: String
    get(){
        return _contentModified.format(formatter)
    }
    val created: String
        get(){
            return _created.format(formatter)
        }
}
