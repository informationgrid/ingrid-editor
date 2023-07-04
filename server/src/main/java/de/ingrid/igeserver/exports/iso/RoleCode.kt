package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class RoleCode(
    @JacksonXmlProperty(localName = "CI_RoleCode") var codelist: CodelistAttributes? = null
)
