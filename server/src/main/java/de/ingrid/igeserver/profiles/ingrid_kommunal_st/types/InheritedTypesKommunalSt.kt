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
package de.ingrid.igeserver.profiles.ingrid_kommunal_st.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridPersonType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridDataCollectionTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridGeoServiceTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridInformationSystemTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridLiteratureTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridLiteratureType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridProjectTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridSpecialisedTaskTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridOrganisationTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}

@Component
class InGridPersonTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridPersonType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}