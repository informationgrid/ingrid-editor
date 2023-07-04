package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ReferenceSystem(
    @JacksonXmlProperty(localName = "MD_ReferenceSystem") val referenceSystem: MDReferenceSystem?
)

data class MDReferenceSystem(
    val referenceSystemIdentifier: ReferenceSystemIdentifier
)
