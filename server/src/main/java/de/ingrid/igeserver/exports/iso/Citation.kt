package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Citation(
    @JacksonXmlProperty(localName = "CI_Citation") val citation: CICitation?
)

data class CICitation(
    val title: CharacterString?,
    val date: Date?,
    
)