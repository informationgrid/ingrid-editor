package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class SVServiceIdentification(
    val citation: Citation?,
    val abstract: CharacterString?,
    val pointOfContact: List<PointOfContact>?,
    val resourceMaintenance: String?,
    val descriptiveKeywords: List<String>?,
    val resourceConstraints: List<String>?,
    val serviceType: String?,
    val extent: String?,
    val coupledResource: String?,
    val couplingType: String?,
    val containsOperations: String?,
    val operatesOn: String?,
)

data class PointOfContact(
    @JacksonXmlProperty(localName = "CI_ResponsibleParty") val responsibleParty: ResponsibleParty?
)