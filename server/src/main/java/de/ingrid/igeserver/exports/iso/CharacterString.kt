package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class CharacterString(
    @XmlElement(name = "CharacterString", namespace = "http://www.isotc211.org/2005/gco")
    var text: String? = null
)
