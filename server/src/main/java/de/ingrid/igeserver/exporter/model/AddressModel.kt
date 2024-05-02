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
package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.model.KeyValue
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_id") val id: Int,
    @JsonProperty("_type") val docType: String,
    val salutation: KeyValue?,
    @JsonProperty("academic-title") val academicTitle: KeyValue?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel> = emptyList(),
    val hideAddress: Boolean?,
    var address: Address = Address("", "", "", "", "", null, null),
    var positionName: String?,
    var hoursOfService: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") val created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") val modified: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_contentModified") val contentmodified: OffsetDateTime,
    @JsonProperty("_parent") val parent: Int?,
) {

    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    private fun contactType(type: String): String? = contact
        .firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValue?, val connection: String?)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Address(
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValue?,
    val country: KeyValue?
) {
    val countryKey = country?.key ?: ""

}
