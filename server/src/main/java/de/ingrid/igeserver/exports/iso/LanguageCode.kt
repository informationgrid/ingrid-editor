package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlElement

class LanguageCode {
    @XmlElement(name = "LanguageCode")
    var codelist: CodelistAttributes? = null
}
