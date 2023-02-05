package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement

data class EXExtentOrig(
    @JacksonXmlProperty(localName = "EX_Extent") val extend: EXExtent?
)

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXExtent(
    val geographicElement: List<EXGeographicDescription>?,
    val temporalElement: EXTemporalExtent?
)

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXTemporalExtent(
    @JacksonXmlProperty(localName = "EX_TemporalExtent") val extent: TemportalExtentSub?
)

data class TemportalExtentSub(
    val extent: TemportalExtent?
)

data class TemportalExtent(
    @JacksonXmlProperty(localName = "TimePeriod") val timePeriod: TimePeriod?
)

data class TimePeriod(
    @JacksonXmlProperty(isAttribute = true) val id: String?,
    val beginPosition: String?,
    val endPosition: String?,
)


@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXGeographicDescription(
    @JacksonXmlProperty(localName = "EX_GeographicDescription") val geographicDescription: GeographicDescription?
)

data class GeographicDescription(
    val extentTypeCode: BoolType?,
    val geographicIdentifier: GeographicIdentifier?,
)

data class BoolType(
    @JacksonXmlProperty(localName = "Boolean") val value: String?
)

data class GeographicIdentifier(
    @JacksonXmlProperty(localName = "MD_Identifier") val mdIdentifier: MDIdentifier?
)

data class MDIdentifier(
    val code: CharacterString?
)