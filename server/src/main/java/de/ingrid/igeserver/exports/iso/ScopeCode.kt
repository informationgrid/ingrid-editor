package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ScopeCode(
    @JacksonXmlProperty(localName = "MD_ScopeCode") var scopeCode: CodelistAttributes? = null
)
