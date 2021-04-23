package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAttribute
import javax.xml.bind.annotation.XmlElement

class ResponsibleParty {
    @XmlAttribute
    var uuid: String? = null
    private val individualName: String? = null
    private val organisationName: String? = null
    private val positionName: String? = null

    @XmlElement(name = "contactInfo")
    var contactInfo: ContactInfo? = null

    @XmlElement(name = "role")
    private var role: RoleCode? = null
    fun setRole(codelistAttr: CodelistAttributes?) {
        role = RoleCode()
        role!!.codelist = codelistAttr
    }
}
