package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.*

@XmlAccessorType(XmlAccessType.FIELD)
data class CharacterString(
    @field:XmlElement(name = "CharacterString", namespace = "http://www.isotc211.org/2005/gco")
    var text: String? = null
)
