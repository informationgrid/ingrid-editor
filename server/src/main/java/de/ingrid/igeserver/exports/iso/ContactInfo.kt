package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class ContactInfo {
    @XmlElement(name = "CI_Contact")
    private var ciContact: CIContact? = null
    fun setAddress(type: ContactType?, value: String?) {
        val aw = AddressWrapper()
        aw.address = Address()
        aw.address!!.electronicMailAddress = CharacterString(value)
        val ciContact = CIContact()
        ciContact.address = aw
        this.ciContact = ciContact
    }

    private class CIContact {
        @XmlElement(name = "address")
        var address: AddressWrapper? = null
    }

    private class AddressWrapper {
        //        @XmlElement(name = "CI_Address")
        //        public Address phone;
        @XmlElement(name = "CI_Address")
        var address: Address? = null //        @XmlElement(name = "CI_Address")
        //        public Address onlineResource;
        //        
        //        @XmlElement(name = "CI_Address")
        //        public Address hoursOfService;
        //        
        //        @XmlElement(name = "CI_Address")
        //        public Address contactInstructions;
    }

    private class Address {
        var deliveryPoint: CharacterString? = null
        var city: CharacterString? = null
        var administrativeArea: CharacterString? = null
        var postalCode: CharacterString? = null
        var country: CharacterString? = null
        var electronicMailAddress: CharacterString? = null
    }
}
