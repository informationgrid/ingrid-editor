package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    val salutation: KeyValueModel?,
    @JsonProperty("academic-title") val academicTitle: KeyValueModel?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel>?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
    var parentUuid: String? = null,
    var parentName: String? = null,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") val created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") val modified: OffsetDateTime,
    @JsonProperty("_parent") val parent: Int,
) {

    companion object {
        val documentService: DocumentService? by lazy {
            SpringContext.getBean(DocumentService::class.java)
        }
    }

    init {
        if (address.inheritAddress) {
            address = getAddressInformationFromParent(parent)
        }
    }

    private fun getAddressInformationFromParent(parentId: Int?): Address {
        val emptyAddress = Address(false, "", "", "", "", "", null, null)
        if (parentId == null) return emptyAddress

        val parentAddress = documentService?.getWrapperByDocumentId(parentId) ?: return emptyAddress

        val jsonParentAddress = parentAddress.published?.data?.get("address") ?: return emptyAddress
        val parent = jacksonObjectMapper().readValue(jsonParentAddress.toString(), Address::class.java)

        return if (parent.inheritAddress)
            getAddressInformationFromParent(parentAddress.parent?.id)
        else parent

    }

/*    @JsonProperty("_parent")
    private fun setParent(value: Int?) {
        if (value != null) {
            val parentAddress = documentService?.getWrapperByDocumentId(value)
            parentUuid = parentAddress?.uuid
            parentName = parentAddress?.published?.title
        }
    }*/

    fun getNamePresentation() = organization ?: "$lastName, $firstName"
    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    private fun contactType(type: String): String? = contact
        ?.firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValueModel?, val connection: String?)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Address(
    val inheritAddress: Boolean = false,
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValueModel?,
    val country: KeyValueModel?
) {

}
