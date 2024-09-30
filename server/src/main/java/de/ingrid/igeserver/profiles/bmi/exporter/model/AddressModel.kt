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
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    var type: String?,
    val salutation: KeyValue?,
    @JsonProperty("academic-title") val academicTitle: KeyValue?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel>,
    val hideAddress: Boolean?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
) {

    companion object {
        val documentService: DocumentService? by lazy {
            SpringContext.getBean(DocumentService::class.java)
        }
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }

    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    val dcatType: String? get() = when (type) {
        "2" -> "maintainer"
        "6" -> "originator"
        "7" -> "contactPoint"
        "10" -> "publisher"
        "11" -> "creator"
        else -> null
    }

    private fun contactType(type: String): String? = contact
        .firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValue?, val connection: String?) {
    val typeLabel: String?
        get() = AddressModel.codeListService?.getCodeListValue("4430", type?.key, "en")
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class Address(
    val inheritAddress: Boolean = false,
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValue?,
    val country: KeyValue?,
) {
    val countryKey = country?.key ?: ""

    val countryName: String?
        get() = AddressModel.codeListService?.getCodeListValue("6200", country?.key, "de")
}
