package de.ingrid.igeserver.profiles.ingrid_krzn.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridPersonType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/krzn/geo-dataset_krzn.schema.json"

    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridDataCollectionTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridGeoServiceTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridInformationSystemTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridLiteratureTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridLiteratureType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridProjectTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridSpecialisedTaskTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridOrganisationTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridPersonTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridPersonType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-krzn")
}