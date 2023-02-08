package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class CharacterString(
    @JacksonXmlProperty(localName="CharacterString", namespace="http://www.isotc211.org/2005/gco")
    private var text: String? = null,
    @JacksonXmlProperty(localName="Anchor", namespace="http://www.isotc211.org/2005/gmx")
    private var anchor: Anchor? = null
) {
    val value = text ?: anchor?.value
    val anchorHref = anchor?.href
    val isAnchor = anchor != null
}
