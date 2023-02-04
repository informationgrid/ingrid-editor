package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

data class ContactInfo(
    @JacksonXmlProperty(localName = "CI_Contact") var ciContact: CIContact? = null,
) {
    fun setAddress(value: String?) {
        val aw = AddressWrapper()
        aw.address = Address()
        aw.address!!.electronicMailAddress = CharacterString(value)
        val ciContact = CIContact()
        ciContact.address = aw
        this.ciContact = ciContact
    }
}

data class CIContact(
    @JacksonXmlProperty(localName = "address") var address: AddressWrapper? = null
)

data class AddressWrapper(
    //        @XmlElement(name = "CI_Address")
    //        public Address phone;
    @JacksonXmlProperty(localName = "CI_Address") var address: Address? = null //        @XmlElement(name = "CI_Address")
    //        public Address onlineResource;
    //
    //        @XmlElement(name = "CI_Address")
    //        public Address hoursOfService;
    //
    //        @XmlElement(name = "CI_Address")
    //        public Address contactInstructions;
)

data class Address(
    var deliveryPoint: CharacterString? = null,
    var city: CharacterString? = null,
    var administrativeArea: CharacterString? = null,
    var postalCode: CharacterString? = null,
    var country: CharacterString? = null,
    var electronicMailAddress: CharacterString? = null
)
