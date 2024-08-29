/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

data class EXExtentOrig(
    @JacksonXmlProperty(localName = "EX_Extent") val extend: EXExtent?,
)

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXExtent(
    val description: CharacterString?,
    val geographicElement: List<EXGeographicDescription>?,
    val temporalElement: List<EXTemporalExtent>?,
    val verticalElement: List<EXVerticalExtent>?,
)

data class EXVerticalExtent(
    @JacksonXmlProperty(localName = "EX_VerticalExtent") val verticalElement: VerticalExtent?,
)

data class VerticalExtent(
    val minimumValue: Real,
    val maximumValue: Real,
    val verticalCRS: VerticalCRS,
)

data class VerticalCRS(
    @JacksonXmlProperty(localName = "VerticalCRS") val verticalCRS: VerticalCRSChoice,
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
    val verticalDatum: VerticalDatum?,
)

data class VerticalDatum(
    val name: String?,
)

data class VerticalCS(
    @JacksonXmlProperty(localName = "VerticalCS") val verticalCS: VerticalCSChoice?,
)

data class VerticalCSChoice(
    val identifier: CharacterString,
    val axis: CoordinateSystemAxisWrapper,
)

data class CoordinateSystemAxisWrapper(
    @JacksonXmlProperty(localName = "CoordinateSystemAxis") val coordinateSystemAxis: CoordinateSystemAxis?,
)

data class CoordinateSystemAxis(
    @JacksonXmlProperty(isAttribute = true) val uom: String?,
)

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXTemporalExtent(
    @JacksonXmlProperty(localName = "EX_TemporalExtent") val extent: TemportalExtentSub?,
)

data class TemportalExtentSub(
    val extent: TemportalExtent?,
)

data class TemportalExtent(
    @JacksonXmlProperty(localName = "TimePeriod") val timePeriod: TimePeriod?,
    @JacksonXmlProperty(localName = "TimeInstant") val timeInstant: TimeInstant?,
)

data class TimeInstant(val timePosition: String)

data class TimePeriod(
    @JacksonXmlProperty(isAttribute = true) val id: String?,
//    val beginPosition: String?,
    val beginPosition: TemporalPosition?,
//    val endPosition: String?,
    val endPosition: TemporalPosition?,
)

class TemporalPosition {
    @JacksonXmlProperty(isAttribute = true)
    val indeterminatePosition: String? = null
//    val value: String? = null

    @JacksonXmlText
    val value: String? = null
}

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
)
data class EXGeographicDescription(
    @JacksonXmlProperty(localName = "EX_BoundingPolygon") val boundingPolygon: BoundingPolygon?,
    @JacksonXmlProperty(localName = "EX_GeographicBoundingBox") val geographicBoundingBox: GeographicBoundingBox?,
    @JacksonXmlProperty(localName = "EX_GeographicDescription") val geographicDescription: GeographicDescription?,
)

data class BoundingPolygon(
    val polygon: ObjectNode? = null,
)

class GeographicBoundingBox(
    val westBoundLongitude: Decimal?,
    val eastBoundLongitude: Decimal?,
    val southBoundLatitude: Decimal?,
    val northBoundLatitude: Decimal?,
)

data class GeographicDescription(
    val extentTypeCode: BoolType?,
    val geographicIdentifier: Identifier?,
)

data class BoolType(
    @JacksonXmlProperty(localName = "Boolean") val value: String?,
)

data class Identifier(
    @JacksonXmlProperty(localName = "MD_Identifier") val mdIdentifier: MDIdentifier?,
)

data class MDIdentifier(
    val code: CharacterString?,
)
