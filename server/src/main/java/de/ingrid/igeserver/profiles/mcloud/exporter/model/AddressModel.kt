package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
        @JsonProperty("_id") val uuid: String,
        val firstName: String,
        val lastName: String,
        val organization: String,
        val title: String,
        val contact: List<ContactModel>
) {

    val homepage: String?
    get() {
        return contact
                .firstOrNull { it.type == "4" }
                ?.connection
    }
}

data class ContactModel(val type: String?, val connection: String?)