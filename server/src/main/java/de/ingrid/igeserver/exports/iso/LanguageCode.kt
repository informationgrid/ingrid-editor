package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

data class LanguageCode(
    @JacksonXmlProperty(localName = "LanguageCode", namespace = "http://www.isotc211.org/2005/gmd")
    var codelist: CodelistAttributes? = null
)
