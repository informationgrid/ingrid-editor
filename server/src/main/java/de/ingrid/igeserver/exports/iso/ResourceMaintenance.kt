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

data class ResourceMaintenance(
    @JacksonXmlProperty(localName = "MD_MaintenanceInformation") val maintenanceInformation: MaintenanceInformation?
)

data class MaintenanceInformation(
    val maintenanceAndUpdateFrequency: MaintenanceFrequencyCode,
    val userDefinedMaintenanceFrequency: UserDefinedMaintenanceFrequency?,
    val updateScope: ScopeCode?,
    val maintenanceNote: List<CharacterString>?,
)

data class MaintenanceFrequencyCode(
    @JacksonXmlProperty(localName = "MD_MaintenanceFrequencyCode") val code: CodelistAttributes?
)

data class UserDefinedMaintenanceFrequency(
    @JacksonXmlProperty(localName = "TM_PeriodDuration") val periodDuration: String?
)