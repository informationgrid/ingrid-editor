package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Contact(
    @JacksonXmlProperty(localName = "CI_ResponsibleParty") var responsibleParty: ResponsibleParty? = null
)
