package de.ingrid.igeserver.profiles.bmi.types

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class BmiAddressType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {

    override val jsonSchema = "/bmi/schemes/address.schema.json"

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf("bmi")

    override val className = "BmiAddressDoc"
}
