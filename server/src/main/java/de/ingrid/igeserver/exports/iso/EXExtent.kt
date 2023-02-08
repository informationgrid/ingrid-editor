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
    val description: CharacterString?,
    val geographicElement: List<EXGeographicDescription>?,
    val temporalElement: List<EXTemporalExtent>?,
    val verticalElement: List<EXVerticalExtent>?
)

data class EXVerticalExtent(
    @JacksonXmlProperty(localName = "EX_VerticalExtent") val verticalElement: VerticalExtent?
)

data class VerticalExtent(
    val minimumValue: Real,
    val maximumValue: Real,
    val verticalCRS: VerticalCRS
)

data class VerticalCRS(
    @JacksonXmlProperty(localName = "VerticalCRS") val verticalCRS: VerticalCRSChoice
)

data class VerticalCRSChoice(
    val description: CharacterString?,
    val descriptionReference: CharacterString?,
    val identifier: CharacterString,
    val name: CharacterString?,
    val verticalCS: VerticalCS,
    val verticalDatum: VerticalDatumWrapper,
)

data class VerticalDatumWrapper(
    val verticalDatum: VerticalDatum?
)

data class VerticalDatum(
    val name: String?
)

data class VerticalCS(
    @JacksonXmlProperty(localName = "VerticalCS") val verticalCS: VerticalCSChoice?
)

data class VerticalCSChoice(
    val identifier: CharacterString,
    val axis: CoordinateSystemAxisWrapper
)

data class CoordinateSystemAxisWrapper(
    @JacksonXmlProperty(localName = "CoordinateSystemAxis") val coordinateSystemAxis: CoordinateSystemAxis?
)

data class CoordinateSystemAxis(
    @JacksonXmlProperty(isAttribute = true) val uom: String?
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
    @JacksonXmlProperty(localName = "EX_GeographicDescription") val geographicDescription: GeographicDescription?,
    @JacksonXmlProperty(localName = "EX_GeographicBoundingBox") val geographicBoundingBox: GeographicBoundingBox?
)

class GeographicBoundingBox(
    val westBoundLongitude: Decimal?,
    val eastBoundLongitude: Decimal?,
    val southBoundLatitude: Decimal?,
    val northBoundLatitude: Decimal?
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