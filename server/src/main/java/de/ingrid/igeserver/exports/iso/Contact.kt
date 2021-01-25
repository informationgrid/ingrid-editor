package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class Contact {
    @XmlElement(name = "CI_ResponsibleParty")
    var responsibleParty: ResponsibleParty? = null
}
