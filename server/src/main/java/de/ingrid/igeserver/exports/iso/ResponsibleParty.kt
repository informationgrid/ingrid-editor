package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlAttribute
import javax.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class ResponsibleParty(
    @XmlAttribute var uuid: String? = null,
    val individualName: String? = null,
    val organisationName: String? = null,
    val positionName: String? = null,
    @XmlElement(name = "contactInfo") var contactInfo: ContactInfo? = null,
    @XmlElement(name = "role") var role: RoleCode? = null
) {
    fun setRole(codelistAttr: CodelistAttributes?) {
        role = RoleCode()
        role!!.codelist = codelistAttr
    }
}
