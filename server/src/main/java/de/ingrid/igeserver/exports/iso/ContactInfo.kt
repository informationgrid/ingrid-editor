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
package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ContactInfo(
    @JacksonXmlProperty(localName = "CI_Contact") var ciContact: CIContact? = null,
)

data class CIContact(
    val phone: CharacterString?,
    val address: AddressWrapper?,
    val onlineResource: CharacterString?,
    val hoursOfService: CharacterString?,
    val contactInstructions: CharacterString?,
)

data class AddressWrapper(
    @JacksonXmlProperty(localName = "CI_Address") var address: Address? = null //        @XmlElement(name = "CI_Address")
)

data class Address(
    var deliveryPoint: List<CharacterString>? = null,
    var city: CharacterString? = null,
    var administrativeArea: CharacterString? = null,
    var postalCode: CharacterString? = null,
    var country: CharacterString? = null,
    var electronicMailAddress: List<CharacterString>? = null
)
