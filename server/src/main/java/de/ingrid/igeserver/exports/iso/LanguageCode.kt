package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class LanguageCode(
    @JacksonXmlProperty(localName = "LanguageCode", namespace = "http://www.isotc211.org/2005/gmd")
    var codelist: CodelistAttributes? = null
)
