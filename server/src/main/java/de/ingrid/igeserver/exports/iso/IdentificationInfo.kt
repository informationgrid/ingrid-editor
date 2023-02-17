package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class IdentificationInfo(
    @JacksonXmlProperty(localName = "SV_ServiceIdentification") private val serviceIdentificationInfo: SVServiceIdentification?,
    @JacksonXmlProperty(localName = "MD_DataIdentification") val dataIdentificationInfo: MDDataIdentification?
){
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
    override val extent: EXExtentOrig?,
    override val coupledResource: CoupledResource?,
    override val couplingType: CouplingType?,
    override val containsOperations: List<ContainsOperation>?,
    override val operatesOn: List<OperatesOn>?,
    // ---- only dataset
    val spatialRepresentationType: List<SpatialRepresentationType>?,
    val spatialResolution: List<CharacterString>?,
    val language: List<Language>,
    val characterSet: List<CharacterSet>?,
    val topicCategory: List<TopicCategory>?,
    val environmentDescription: CharacterString?,
    // extent: List<CharacterString>?,
    val supplementalInformation: CharacterString?
) : SVServiceIdentification(
    citation,
    abstract, purpose, status, pointOfContact, resourceMaintenance, descriptiveKeywords, resourceSpecificUsage,
    resourceConstraints, graphicOverview, serviceType, serviceTypeVersion, extent, coupledResource, couplingType,
    containsOperations, operatesOn
)

data class TopicCategory(
    @JacksonXmlProperty(localName = "MD_TopicCategoryCode") val value: String?
)

data class CharacterSet(
    @JacksonXmlProperty(localName = "MD_CharacterSetCode") val code: CodelistAttributes?
)

data class Language(
    @JacksonXmlProperty(localName = "LanguageCode") val code: CodelistAttributes?
)

data class SpatialRepresentationType(
    @JacksonXmlProperty(localName = "MD_SpatialRepresentationTypeCode") val code: CodelistAttributes? 
)