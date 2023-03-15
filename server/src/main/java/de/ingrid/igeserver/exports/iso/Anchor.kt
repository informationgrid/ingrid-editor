package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

data class Anchor(
    @JacksonXmlProperty(isAttribute = true) var href: String? = null,
) {
    @JacksonXmlText val value: String? = null
}
