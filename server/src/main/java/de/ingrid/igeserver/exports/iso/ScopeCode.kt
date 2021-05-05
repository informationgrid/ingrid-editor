package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class ScopeCode(
    @XmlElement(name = "MD_ScopeCode") var codelist: CodelistAttributes? = null
)
