package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlAttribute
import javax.xml.bind.annotation.XmlValue

data class CodelistAttributes(
    @JacksonXmlProperty(isAttribute = true, localName = "codeList") var codeList: String? = null,
    @JacksonXmlProperty(isAttribute = true, localName = "codeListValue") var codeListValue: String? = null,
    @JacksonXmlProperty var content: String? = null
)