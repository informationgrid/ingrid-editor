package de.ingrid.igeserver.profiles.krzn.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val className = "InGridGeoDatasetKrzn"
    override val jsonSchema = "/ingrid/schemes/krzn/geo-dataset_krzn.schema.json"
}

@Component
class InGridDataCollectionTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val className = "InGridDataCollectionKrzn"
}

@Component
class InGridGeoServiceTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val className = "InGridGeoServiceKrzn"
}

@Component
class InGridInformationSystemTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val className = "InGridInformationSystemKrzn"
}

@Component
class InGridLiteratureTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridLiteratureType(jdbcTemplate) {
    override val className = "InGridLiteratureKrzn"
}

@Component
class InGridProjectTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val className = "InGridProjectKrzn"
}

@Component
class InGridSpecialisedTaskTypeKrzn @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val className = "InGridSpecialisedTaskKrzn"
}