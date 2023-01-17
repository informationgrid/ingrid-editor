package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_type") val type: String,
    val title: String,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
) {

    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")

    var documentType = mapDocumentType()

    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(): String {
        return when (type) {
            "InGridSpecialisedTask" -> "0"
            "InGridGeoDataset" -> "1"
            "InGridLiterature" -> "2"
            "InGridGeoService" -> "3"
            "InGridProject" -> "4"
            "InGridDataCollection" -> "5"
            "InGridInformationSystem" -> "6"
            else -> throw ServerException.withReason("Could not map document type: $type")
        }
    }

    val parentUuid: String? = data._parent
    var pointOfContact: AddressModel? = null

    init {
        pointOfContact = determinePointOfContact()
    }

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }

    private fun determinePointOfContact(): AddressModel? {

        val ref = data.pointOfContact
            ?.firstOrNull()
            ?.ref ?: return null

        val nonHiddenAddress = ref.getAncestorAddressesIncludingSelf(ref.id)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else null

    }


    private fun prepareSpatialString(spatial: SpatialModel): String {
        val coordinates =
            "${spatial.value?.lon1}, ${spatial.value?.lat1}, ${spatial.value?.lon2}, ${spatial.value?.lat2}"
        val title = spatial.title ?: ""
        return "${title}: $coordinates"
    }

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


    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime) = formatter.format(Date.from(date.toInstant()))

    fun getPostBoxString(): String {
        return "Postbox ${pointOfContact?.address?.poBox}, ${pointOfContact?.address?.zipPoBox ?: pointOfContact?.address?.poBox} ${pointOfContact?.address?.city}"
    }

    fun hasPoBox(): Boolean = !pointOfContact?.address?.poBox.isNullOrEmpty()


    private fun getPersonStringFromJson(address: AddressModel): String {
        return listOfNotNull(
            getCodelistValue(
                "4300",
                address.salutation
            ),
            getCodelistValue(
                "4305",
                address.academicTitle
            ),
            address.firstName,
            address.lastName
        ).joinToString(" ")
    }

}

data class AddressShort(val uuid: String, val title: String)
