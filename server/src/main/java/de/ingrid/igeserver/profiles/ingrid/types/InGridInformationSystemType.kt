package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridInformationSystemType(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val className = "InGridInformationSystem"

    override val jsonSchema = "/ingrid/schemes/information-system.schema.json"
}
