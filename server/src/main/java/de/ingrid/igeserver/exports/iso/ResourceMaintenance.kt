package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class ResourceMaintenance(
    @JacksonXmlProperty(localName = "MD_MaintenanceInformation") val maintenanceInformation: MaintenanceInformation?
)

data class MaintenanceInformation(
    val maintenanceAndUpdateFrequency: MaintenanceFrequencyCode?,
    val updateScope: ScopeCode?
)

data class MaintenanceFrequencyCode(
    @JacksonXmlProperty(localName = "MD_MaintenanceFrequencyCode") val code: CodelistAttributes?
)