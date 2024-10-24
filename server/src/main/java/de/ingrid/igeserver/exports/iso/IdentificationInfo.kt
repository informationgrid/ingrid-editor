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

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

data class IdentificationInfo(
    @JacksonXmlProperty(localName = "SV_ServiceIdentification") private val serviceIdentificationInfo: SVServiceIdentification?,
    @JacksonXmlProperty(localName = "MD_DataIdentification") val dataIdentificationInfo: MDDataIdentification?,
) {
    val identificationInfo = serviceIdentificationInfo ?: dataIdentificationInfo
}

class MDDataIdentification(
    override val citation: Citation,
    override val abstract: CharacterString,
    override val purpose: CharacterString?,
    override val status: Status?,
    override val pointOfContact: List<Contact>?,
    override val resourceMaintenance: ResourceMaintenance?,
    override val descriptiveKeywords: List<DescriptiveKeyword>?,
    override val resourceSpecificUsage: List<SpecificUsage>?,
    override val resourceConstraints: List<ResourceConstraint>?,
    override val graphicOverview: List<GraphicOverview>?,
    override val serviceType: LocalName?,
    override val serviceTypeVersion: List<CharacterString>?,
    override val extent: List<EXExtentOrig>?,
    override val coupledResource: CoupledResource?,
    override val couplingType: CouplingType?,
    override val containsOperations: List<ContainsOperation>?,
    override val operatesOn: List<OperatesOn>?,
    // ---- only dataset
    val spatialRepresentationType: List<SpatialRepresentationType>?,
    val spatialResolution: List<SpatialResolution>?,
    val language: List<Language>,
    val characterSet: List<CharacterSet>?,
    val topicCategory: List<TopicCategory>?,
    val environmentDescription: CharacterString?,
    // extent: List<CharacterString>?,
    val supplementalInformation: CharacterString?,
) : SVServiceIdentification(
    citation,
    abstract, purpose, status, pointOfContact, resourceMaintenance, descriptiveKeywords, resourceSpecificUsage,
    resourceConstraints, graphicOverview, serviceType, serviceTypeVersion, extent, coupledResource, couplingType,
    containsOperations, operatesOn,
)

data class SpatialResolution(
    @JacksonXmlProperty(localName = "MD_Resolution") val mdResolution: MDResolution?,
)

data class MDResolution(
    val equivalentScale: EquivalentScale?,
    val distance: Distance?,
)

data class Distance(
    @JacksonXmlProperty(localName = "Distance") val mdDistance: MDDistance,
)

data class MDDistance(
    @JacksonXmlProperty(isAttribute = true) val uom: String?,
) {
    @JacksonXmlText val value: Float? = null
}

data class MDScale(
    @JacksonXmlProperty(isAttribute = true) val uom: String?,
) {
    @JacksonXmlText val value: Float? = null
}

data class EquivalentScale(
    @JacksonXmlProperty(localName = "MD_RepresentativeFraction") val mdRepresentativeFraction: MDRepresentativeFraction?,
)

data class MDRepresentativeFraction(
    val denominator: MDInteger,
)

data class MDInteger(
    @JacksonXmlProperty(localName = "Integer") val value: Int?,
)

data class TopicCategory(
    @JacksonXmlProperty(localName = "MD_TopicCategoryCode") val value: String?,
)

data class CharacterSet(
    @JacksonXmlProperty(localName = "MD_CharacterSetCode") val code: CodelistAttributes?,
)

data class Language(
    @JacksonXmlProperty(localName = "LanguageCode") val code: CodelistAttributes?,
)

data class SpatialRepresentationType(
    @JacksonXmlProperty(localName = "MD_SpatialRepresentationTypeCode") val code: CodelistAttributes?,
)
