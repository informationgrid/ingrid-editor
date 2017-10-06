package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlElement;



public class ContactInfo {

    @XmlElement(name = "CI_Contact")
    private CIContact ciContact;
    
    
    
    public void setAddress(ContactType type, String value) {
        AddressWrapper aw = new AddressWrapper();
        aw.address = new Address();
        aw.address.electronicMailAddress = new CharacterString( value );
        
        CIContact ciContact = new CIContact();
        ciContact.address = aw;
        this.ciContact = ciContact;
    }
    
    private static class CIContact {
        @XmlElement(name = "address")
        private AddressWrapper address;
    }
    
    private static class AddressWrapper {
        
//        @XmlElement(name = "CI_Address")
//        public Address phone;
        
        @XmlElement(name = "CI_Address")
        public Address address;
        
//        @XmlElement(name = "CI_Address")
//        public Address onlineResource;
//        
//        @XmlElement(name = "CI_Address")
//        public Address hoursOfService;
//        
//        @XmlElement(name = "CI_Address")
//        public Address contactInstructions;
    }
    
    private static class Address {
        
        public CharacterString deliveryPoint;
        public CharacterString city;
        public CharacterString administrativeArea;
        public CharacterString postalCode;
        public CharacterString country;
        public CharacterString electronicMailAddress;
        
    }
}
