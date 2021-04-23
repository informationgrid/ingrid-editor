package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class ScopeCode {
    @XmlElement(name = "MD_ScopeCode")
    var codelist: CodelistAttributes? = null
}
