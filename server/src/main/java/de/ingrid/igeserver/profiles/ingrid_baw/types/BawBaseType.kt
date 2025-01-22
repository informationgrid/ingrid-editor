package de.ingrid.igeserver.profiles.ingrid_baw.types

import de.ingrid.igeserver.profiles.ingrid.types.InGridBaseType
import de.ingrid.igeserver.profiles.ingrid_baw.BawProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
abstract class BawBaseType(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/baw/geo-dataset_baw.schema.json"
    override val profiles = arrayOf(BawProfile.ID)
}
