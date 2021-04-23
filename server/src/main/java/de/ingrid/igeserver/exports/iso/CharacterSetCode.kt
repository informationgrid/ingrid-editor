package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class CharacterSetCode {
    @XmlElement(name = "MD_CharacterSetCode")
    var characterSetCode: CodelistAttributes? = null
}
