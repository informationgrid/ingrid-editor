package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

data class ScopeCode(
    @JacksonXmlProperty(localName = "MD_ScopeCode") var scopeCode: CodelistAttributes? = null,
//    @JacksonXmlProperty(isAttribute = true, localName = "MD_ScopeCode") var codeList: String? = null,
//    @JacksonXmlProperty(isAttribute = true, localName = "MD_ScopeCode") var codeListValue: String? = null,
) {
//    @JacksonXmlText val value2: String? = null
}
