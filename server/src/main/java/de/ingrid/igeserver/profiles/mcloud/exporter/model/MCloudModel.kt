package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.exports.interfaces.dcat.DCAT
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.utils.SpringContext
import org.json.simple.JSONObject
import org.json.simple.parser.JSONParser
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@JsonIgnoreProperties(ignoreUnknown = true)
data class MCloudModel(
    @JsonProperty("_id") override val uuid: String,
    override val title: String,
    override val description: String?,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
    override val downloads: List<DownloadModel>?,
    override val license: String?,
) : DCAT {

    override val publisher: AddressModel?
        get() {
            return data.addresses
                ?.firstOrNull { it.type == "10" }
                ?.ref
        }

    val hasSingleSpatial: Boolean
        get() = realSpatials?.size == 1

    val spatialTitels: List<String>?
        get() = data.spatials?.map { it.title }?.filterNotNull()

    val realSpatials: List<SpatialModel>?
        get() {
            return data.spatials?.filter { it.type == "free" }
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
        if (data.openDataCategories == null) return emptyList()
        return data.openDataCategories
            .map { "http://publications.europa.eu/resource/authority/data-theme/$it" }
    }


    companion object {
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
    }
    fun getLicenseData(): Any? {
        if(data.license != null) {
            var jsonString = "{\"id\":\""+data.license+"\",\"name\":\""+data.license+"\"}";
            val entryID = codeListService?.getCodeListEntryId("6500", data.license, "de")
            if(entryID != null) {
                jsonString = codeListService?.getCodeListEntry("6500", entryID)?.data.toString();
            }
            return if (jsonString.isNullOrEmpty()) null else JSONParser().parse(jsonString)
        }
        return null
    }

    val periodicity: String?
    get(){
        val time_period = codeListService?.getCodeListValue("518", data.periodicity, "en")

        when(time_period){
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
