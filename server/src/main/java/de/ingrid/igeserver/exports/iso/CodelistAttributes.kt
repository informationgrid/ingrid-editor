package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlAttribute

@XmlAccessorType(XmlAccessType.FIELD)
data class CodelistAttributes(
    @XmlAttribute(name = "codeList") var codeList: String? = null,
    @XmlAttribute(name = "codeListValue") var codeListValue: String? = null,
    @XmlAttribute var content: String? = null
)