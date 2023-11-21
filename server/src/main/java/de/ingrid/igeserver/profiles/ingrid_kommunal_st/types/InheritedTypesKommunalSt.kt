package de.ingrid.igeserver.profiles.ingrid_kommunal_st.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
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
class InGridPersonTypeKommunalSt(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-kommunal-st")
}