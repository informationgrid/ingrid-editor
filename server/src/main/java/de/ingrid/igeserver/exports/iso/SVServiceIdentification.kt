package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement

open class SVServiceIdentification(
    open val citation: Citation,
    open val abstract: CharacterString,
    open val purpose: CharacterString?,
    open val status: Status?,
    open val pointOfContact: List<Contact>?,
    open val resourceMaintenance: ResourceMaintenance?,
    open val descriptiveKeywords: List<DescriptiveKeyword>?,
    open val resourceSpecificUsage: List<SpecificUsage>?,
    open val resourceConstraints: List<ResourceConstraint>?,
    open val graphicOverview: List<GraphicOverview>?,
    @JacksonXmlProperty(localName = "serviceType", namespace = "http://www.isotc211.org/2005/srv")
    open val serviceType: LocalName?,
    open val serviceTypeVersion: List<CharacterString>?,
    @JacksonXmlProperty(namespace = "http://www.isotc211.org/2005/srv")
    open val extent: List<EXExtentOrig>?,
    open val coupledResource: CoupledResource?,
    open val couplingType: CouplingType?,
    open val containsOperations: List<ContainsOperation>?,
    open val operatesOn: List<OperatesOn>?,
)

data class SpecificUsage(
    @JacksonXmlProperty(localName = "MD_Usage") val usage: MDUsage?
)

data class MDUsage(
    val specificUsage: CharacterString,
    val userContactInfo: Contact,
)

data class Status(
    @JacksonXmlProperty(localName = "MD_ProgressCode") val code: CodelistAttributes?
)

data class GraphicOverview(
    @JacksonXmlProperty(localName = "MD_BrowseGraphic") val mdBrowseGraphic: MDBrowseGraphic?
)

data class MDBrowseGraphic(
    val fileName: CharacterString,
    val fileDescription: CharacterString?,
    val fileType: CharacterString?
)

data class OperatesOn(
    @JacksonXmlProperty(isAttribute = true) val uuidref: String?,
    @JacksonXmlProperty(isAttribute = true) val href: String?,
)

data class ContainsOperation(
    @JacksonXmlProperty(localName = "SV_OperationMetadata") val svOperationMetadata: SVOperationMetadata?
)

data class SVOperationMetadata(
    val operationName: CharacterString?,
    val operationDescription: CharacterString?,
    @JacksonXmlProperty(localName = "DCP") val dcp: List<DCPList>?,
    val connectPoint: List<ConnectPoint>?,
)

data class DCPList(
    @JacksonXmlProperty(localName = "DCPList") val code: CodelistAttributes?

)

data class ConnectPoint(
    @JacksonXmlProperty(localName = "CI_OnlineResource") val ciOnlineResource: CIOnlineResource?
)

data class CouplingType(
    @JacksonXmlProperty(localName = "SV_CouplingType") val code: CodelistAttributes?
)

data class CoupledResource(
    @JacksonXmlProperty(localName = "SV_CoupledResource") val resource: SVCoupledResource?
)

data class SVCoupledResource(
    val operationName: String?,
    val identifier: CharacterString?,
)

@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gco",
)
class LocalName {
    @JacksonXmlProperty(localName = "LocalName")
    val value: String? = null
}

data class ResourceConstraint(
    @JacksonXmlProperty(localName = "MD_LegalConstraints") val legalConstraint: MDLegalConstraint?
)

data class MDLegalConstraint(
    val useLimitation: List<CharacterString>?,
    val accessConstraints: List<MDRestrictionCode>?,
    val useConstraints: List<MDRestrictionCode>?,
    val otherConstraints: List<CharacterString>?
)

data class MDRestrictionCode(
    @JacksonXmlProperty(localName = "MD_RestrictionCode") val code: CodelistAttributes?
)
