package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridSpecialisedTaskType @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val className = "InGridSpecialisedTask"

    override val jsonSchema = "/ingrid/schemes/specialised-task.schema.json"
}
