package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.DownloadModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.KeyValueModel
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

    fun getSpatial(): String? {
        return data.spatials
            ?.filter { it.type == "free" }
            ?.map { "${it.title}: ${it.value?.lon1}, ${it.value?.lat1}, ${it.value?.lon2}, ${it.value?.lat2}" }
            ?.getOrNull(0)
    }

    val steps = data.steps

    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }


    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String {
        if (entry == null) return ""

        if (entry.key == null) return entry.value!!

        return codelistHandler?.getCodelistValue(codelistId, entry.key) ?: "???"
    }

    fun getUvpNumbers(): List<UVPNumber> {
        return data.uvpNumbers
    }

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private val formatterOnlyDate = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val modified: String
        get() {
            return _modified.format(formatterOnlyDate)
        }
}
