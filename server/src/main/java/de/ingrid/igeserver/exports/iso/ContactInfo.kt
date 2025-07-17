/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ContactInfo(
    @JacksonXmlProperty(localName = "CI_Contact") var ciContact: CIContact? = null,
)

data class CIContact(
    val phone: PhoneWrapper?,
    val address: AddressWrapper?,
    val onlineResource: OnlineResourceWrapper?,
    val hoursOfService: CharacterString?,
    val contactInstructions: CharacterString?,
)

data class OnlineResourceWrapper(
    @JacksonXmlProperty(localName = "CI_OnlineResource") var onlineResource: CIOnlineResource? = null,
)

data class PhoneWrapper(
    @JacksonXmlProperty(localName = "CI_Telephone") var phone: Phone? = null,
)

data class Phone(
    var voice: List<CharacterString>? = null,
    var facsimile: List<CharacterString>? = null,
)

data class AddressWrapper(
    @JacksonXmlProperty(localName = "CI_Address") var address: Address? = null,
)

data class Address(
    var deliveryPoint: List<CharacterString>? = null,
    var city: CharacterString? = null,
    var administrativeArea: CharacterString? = null,
    var postalCode: CharacterString? = null,
    var country: CharacterString? = null,
    var electronicMailAddress: List<CharacterString>? = null,
)
