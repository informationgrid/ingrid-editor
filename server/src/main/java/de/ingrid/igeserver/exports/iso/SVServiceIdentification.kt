package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText
import de.ingrid.igeserver.exports.iso19115.Keyword

data class SVServiceIdentification(
    val citation: Citation,
    val abstract: CharacterString,
    val pointOfContact: List<PointOfContact>?,
    val resourceMaintenance: ResourceMaintenance?,
    val descriptiveKeywords: List<DescriptiveKeyword>?,
    val resourceConstraints: List<ResourceConstraint>?,
    @JacksonXmlProperty(localName = "serviceType", namespace = "http://www.isotc211.org/2005/srv")
    val serviceType: LocalName?,
    @JacksonXmlProperty(namespace = "http://www.isotc211.org/2005/srv")
    val extent: EXExtentOrig?,
    val coupledResource: CoupledResource?,
    val couplingType: CouplingType?,
    val containsOperations: ContainsOperation?,
    val operatesOn: List<OperatesOn>?,
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
    @JacksonXmlProperty(localName = "DCP") val dcp: CharacterString?,
    val connectPoint: ConnectPoint?,
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
    @JacksonXmlProperty(localName = "LocalName") val value: String? = null
}

data class ResourceConstraint(
    @JacksonXmlProperty(localName = "MD_LegalConstraints") val legalConstraint: MDLegalConstraint?
)

data class MDLegalConstraint(
    val useLimitation: CharacterString?,
    val useConstraints: MDRestrictionCode?,
    val otherConstraints: CharacterString?
)

data class MDRestrictionCode(
    @JacksonXmlProperty(localName = "MD_RestrictionCode") val code: CodelistAttributes?
)

data class PointOfContact(
    @JacksonXmlProperty(localName = "CI_ResponsibleParty") val responsibleParty: ResponsibleParty?
)