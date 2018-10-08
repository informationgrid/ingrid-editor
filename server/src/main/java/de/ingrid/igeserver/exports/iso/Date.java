package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlElement;

public class Date {
    
    @XmlElement(name = "Date", namespace = "http://www.isotc211.org/2005/gco")
    public String date;

    public Date() {}
    
    public Date(String date) {
        this.date = date;
    }
    
}
