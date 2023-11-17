package de.ingrid.igeserver.profiles.krzn.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/krzn/geo-dataset_krzn.schema.json"

    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridDataCollectionTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridGeoServiceTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridInformationSystemTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridLiteratureTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridLiteratureType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridProjectTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}

@Component
class InGridSpecialisedTaskTypeKrzn(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override fun parentClassName() = super.className
    override val profiles = arrayOf("ingrid-krzn")
}