package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class IdentificationInfo(
    @JacksonXmlProperty(localName = "SV_ServiceIdentification") val serviceIdentificationInfo: SVServiceIdentification?
)