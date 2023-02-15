package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class IdentificationInfo(
    @JacksonXmlProperty(localName = "SV_ServiceIdentification") private val serviceIdentificationInfo: SVServiceIdentification?,
    @JacksonXmlProperty(localName = "MD_DataIdentification") private val dataIdentificationInfo: MDDataIdentification?
){
    val identificationInfo = serviceIdentificationInfo ?: dataIdentificationInfo
}

class MDDataIdentification(
    citation: Citation,
    abstract: CharacterString,
    purpose: CharacterString?,
    status: Status?,
    pointOfContact: List<Contact>?,
    resourceMaintenance: ResourceMaintenance?,
    descriptiveKeywords: List<DescriptiveKeyword>?,
    resourceSpecificUsage: List<SpecificUsage>?,
    resourceConstraints: List<ResourceConstraint>?,
    graphicOverview: List<GraphicOverview>?,
    serviceType: LocalName?,
    serviceTypeVersion: List<CharacterString>?,
    extent: EXExtentOrig?,
    coupledResource: CoupledResource?,
    couplingType: CouplingType?,
    containsOperations: List<ContainsOperation>?,
    operatesOn: List<OperatesOn>?,
    // ---- only dataset
    spatialRepresentationType: List<CharacterString>?,
    spatialResolution: List<CharacterString>?,
    language: List<CharacterString>,
    characterSet: List<CharacterString>?,
    topicCategory: List<CharacterString>?,
    environmentDescription: CharacterString?,
    // extent: List<CharacterString>?,
    supplementalInformation: CharacterString?
) : SVServiceIdentification(
    citation,
    abstract, purpose, status, pointOfContact, resourceMaintenance, descriptiveKeywords, resourceSpecificUsage,
    resourceConstraints, graphicOverview, serviceType, serviceTypeVersion, extent, coupledResource, couplingType,
    containsOperations, operatesOn
) {

}