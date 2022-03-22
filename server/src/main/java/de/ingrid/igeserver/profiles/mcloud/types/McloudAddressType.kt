package de.ingrid.igeserver.profiles.mcloud.types

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class McloudAddressType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {

    override val jsonSchema = "/mcloud/schemes/address.schema.json"

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf("mcloud")

    override val className = "McloudAddressDoc"
}
