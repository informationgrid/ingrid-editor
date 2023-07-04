package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ReferenceSystemIdentifier(
    @JacksonXmlProperty(localName = "RS_Identifier") val identifier: RSIdentifier?
)