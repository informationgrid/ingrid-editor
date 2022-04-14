package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.DownloadModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.KeyValueModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.SpatialModel
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@JsonIgnoreProperties(ignoreUnknown = true)
data class ApprovalProcedureModel(
    @JsonProperty("_uuid") val uuid: String,
    val title: String,
    val description: String?,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
    val distributions: List<DownloadModel>?,
    val license: String?,
) {

    var documentType = "12"
    val parentUuid: String? = data._parent
    val pointOfContact: AddressModel?
        get() {
            return data.pointOfContact
                ?.firstOrNull()
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

    val steps = data.processingSteps

    companion object {
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }


    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String {
        if (entry == null) return "";
        
        if (entry.key == null) return entry.value!!
        
        return codelistHandler?.getCodelistValue(codelistId, entry.key) ?: "???"
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
    
    fun getUvpNumbers(): List<UVPNumber> {
        return data._eiaNumbers
    }

    fun isValid(): Boolean {
        // TODO: implement
        return true
    }

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private val formatterOnlyDate = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val modified: String
        get() {
            return _modified.format(formatterOnlyDate)
        }
}
