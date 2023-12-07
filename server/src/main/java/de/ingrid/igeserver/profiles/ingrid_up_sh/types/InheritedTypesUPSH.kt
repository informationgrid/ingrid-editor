package de.ingrid.igeserver.profiles.ingrid_up_sh.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridDataCollectionTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridGeoServiceTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridInformationSystemTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridLiteratureTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridLiteratureType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridProjectTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridSpecialisedTaskTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridOrganisationTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}

@Component
class InGridPersonTypeUPSH(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-up-sh")
}