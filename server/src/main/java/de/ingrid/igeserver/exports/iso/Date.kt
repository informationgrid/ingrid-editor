package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Date(
    @JacksonXmlProperty(localName = "Date") var date: String? = null,
    @JacksonXmlProperty(localName = "DateTime") var dateTime: String? = null
)
