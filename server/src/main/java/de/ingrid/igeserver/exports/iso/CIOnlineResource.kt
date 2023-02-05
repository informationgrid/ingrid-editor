package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class CIOnlineResource(
    val linkage: Linkage?
)

data class Linkage(
    @JacksonXmlProperty(localName = "URL") val url: String?
)