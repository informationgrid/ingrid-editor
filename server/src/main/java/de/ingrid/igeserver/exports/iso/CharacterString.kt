package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class CharacterString {
    @XmlElement(name = "CharacterString", namespace = "http://www.isotc211.org/2005/gco")
    var text: String? = null

    constructor() {}
    constructor(text: String?) {
        this.text = text
    }
}
