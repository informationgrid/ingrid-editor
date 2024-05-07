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
package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@JsonIgnoreProperties(ignoreUnknown = true)
data class BmiModel(
    @JsonProperty("_uuid") val uuid: String,
    val title: String,
    val description: String?,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
    val distributions: List<DownloadModel>?,
) {

    val creator: AddressModel? get() {return getAddresses("creator")}
    val contactPoint: AddressModel? get() {return getAddresses("contactPoint")}
    val publisher: AddressModel? get() {return getAddresses("publisher")}
    val originator: AddressModel? get() {return getAddresses("originator")}
    val maintainer: AddressModel? get() {return getAddresses("maintainer")}
    val contributor: AddressModel? get() {return getAddresses("contributor")}

    fun getAddresses(type: String) : AddressModel?{
        return data.addresses
                ?.firstOrNull { it.type?.key == type }
                ?.ref
    }
    val hasSingleSpatial: Boolean
        get() = realSpatials?.size == 1

    val spatialTitels: List<String>?
        get() = data.spatials?.map { it.title }?.filterNotNull()

    val ars: List<String>?
        get() = data.spatials?.map { it.ars }?.filterNotNull()

    val realSpatials: List<SpatialModel>?
        get() {
            return data.spatials?.filter { (it.type == "free" && it.value != null) || it.type == "wkt" || it.type == "wfsgnde" }
        }

    val allData: List<String>?
        get() {
            return null
        }

    fun getThemes(): List<String> {
        if (data.DCATThemes == null) return emptyList()
        return data.DCATThemes
                .map { theme -> theme.key }
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
        return _modified.format(formatter)
    }
    val created: String
        get(){
            return _created.format(formatter)
        }
}
