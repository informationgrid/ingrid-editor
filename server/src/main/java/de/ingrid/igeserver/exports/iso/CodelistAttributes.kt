package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAttribute
import javax.xml.bind.annotation.XmlValue

class CodelistAttributes {
    constructor() {}
    constructor(codelist: String?, codelistValue: String?) {
        codeList = codelist
        codeListValue = codelistValue
    }

    constructor(codelist: String?, codelistValue: String?, content: String?) {
        codeList = codelist
        codeListValue = codelistValue
        this.content = content
    }

    @XmlAttribute(name = "codeList")
    var codeList: String? = null

    @XmlAttribute(name = "codeListValue")
    var codeListValue: String? = null

    @XmlValue
    var content: String? = null
}
