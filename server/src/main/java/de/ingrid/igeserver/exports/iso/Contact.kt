package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class Contact(
    @XmlElement(name = "CI_ResponsibleParty") var responsibleParty: ResponsibleParty? = null
)
