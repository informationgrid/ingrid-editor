package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class CharacterString(
    @JacksonXmlProperty(localName="CharacterString", namespace="http://www.isotc211.org/2005/gco")
    var text: String? = null
)
