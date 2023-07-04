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
