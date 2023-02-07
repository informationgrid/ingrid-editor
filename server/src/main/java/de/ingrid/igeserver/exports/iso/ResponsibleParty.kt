package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ResponsibleParty(
    @JacksonXmlProperty(isAttribute = true) var uuid: String? = null,
    val positionName: CharacterString? = null,
    val organisationName: CharacterString? = null,
    var contactInfo: ContactInfo? = null,
    var role: RoleCode
)