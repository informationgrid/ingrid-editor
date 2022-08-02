package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class ContactInfo(
    @XmlElement(name = "CI_Contact") var ciContact: CIContact? = null,
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

@XmlAccessorType(XmlAccessType.FIELD)
data class CIContact(
    @XmlElement(name = "address") var address: AddressWrapper? = null
)

@XmlAccessorType(XmlAccessType.FIELD)
data class AddressWrapper(
    //        @XmlElement(name = "CI_Address")
    //        public Address phone;
    @XmlElement(name = "CI_Address") var address: Address? = null //        @XmlElement(name = "CI_Address")
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
