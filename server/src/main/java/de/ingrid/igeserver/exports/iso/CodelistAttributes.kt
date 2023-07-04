package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

data class CodelistAttributes(
    @JacksonXmlProperty(isAttribute = true) var codeList: String,
    @JacksonXmlProperty(isAttribute = true) var codeListValue: String,
    @JacksonXmlProperty(isAttribute = true) var codeSpace: String? = null,
) {
    @JacksonXmlText val value: String? = null
}