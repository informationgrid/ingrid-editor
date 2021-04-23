package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class RoleCode {
    @XmlElement(name = "CI_RoleCode")
    var codelist: CodelistAttributes? = null
}
