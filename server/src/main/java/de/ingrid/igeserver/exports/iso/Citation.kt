package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class Citation(
    @JacksonXmlProperty(localName = "CI_Citation") val citation: CICitation?
)

data class CICitation(
    val title: CharacterString?,
    val alternateTitle: List<CharacterString>?,
    val date: CitationDate,
    
)

data class CitationDate(
    @JacksonXmlProperty(localName = "CI_Date") val date: CIDate?
)

data class CIDate(
    val date: Date,
    val dateType: DateType
)

data class DateType(
    @JacksonXmlProperty(localName = "CI_DateTypeCode") val code: CodelistAttributes?
)