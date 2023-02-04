package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

data class Contact(
        @JacksonXmlProperty(localName = "CI_ResponsibleParty") var responsibleParty: ResponsibleParty? = null
)
