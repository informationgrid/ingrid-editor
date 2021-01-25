package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class Date {
    @XmlElement(name = "Date", namespace = "http://www.isotc211.org/2005/gco")
    var date: String? = null

    constructor() {}
    constructor(date: String?) {
        this.date = date
    }
}
