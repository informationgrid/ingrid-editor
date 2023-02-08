package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Real(
    @JacksonXmlProperty(localName="Real", namespace="http://www.isotc211.org/2005/gco")
    val value: Float? = null,
)