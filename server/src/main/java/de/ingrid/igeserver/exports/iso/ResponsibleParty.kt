package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlAttribute
import javax.xml.bind.annotation.XmlElement

data class ResponsibleParty(
    @JacksonXmlProperty(isAttribute = true) var uuid: String? = null,
//    val individualName: String? = null,
    val positionName: CharacterString? = null,
    val organisationName: CharacterString? = null,
    var contactInfo: ContactInfo? = null,
    var role: RoleCode? = null
) {
    /*fun setRole(codelistAttr: CodelistAttributes?) {
        role = RoleCode()
        role!!.codelist = codelistAttr
    }*/
}
