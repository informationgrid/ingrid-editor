package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Decimal(
    @JacksonXmlProperty(localName="Decimal", namespace="http://www.isotc211.org/2005/gco")
    var value: Float? = null,
)
