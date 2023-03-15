package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class CIOnlineResource(
    val linkage: Linkage,
    val applicationProfile: CharacterString?,
    val name: CharacterString?,
    val description: CharacterString?,
    val function: CIOnlineFunctionCode?
)

data class CIOnlineFunctionCode(
    @JacksonXmlProperty(localName = "CI_OnLineFunctionCode") val code: CodelistAttributes?
)

data class Linkage(
    @JacksonXmlProperty(localName = "URL") val url: String?
)