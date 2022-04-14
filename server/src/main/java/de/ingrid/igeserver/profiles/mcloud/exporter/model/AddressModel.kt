package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel>?,
    val address: Address?,
    @JsonProperty("_parent") val parent: String?
) {

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
data class Address(
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValueModel?,
    val country: KeyValueModel?
)
