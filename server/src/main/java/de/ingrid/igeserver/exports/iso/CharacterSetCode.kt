package de.ingrid.igeserver.exports.iso

import jakarta.xml.bind.annotation.XmlAccessType
import jakarta.xml.bind.annotation.XmlAccessorType
import jakarta.xml.bind.annotation.XmlElement

@XmlAccessorType(XmlAccessType.FIELD)
data class CharacterSetCode(
    @XmlElement(name = "MD_CharacterSetCode") var characterSetCode: CodelistAttributes? = null
)
