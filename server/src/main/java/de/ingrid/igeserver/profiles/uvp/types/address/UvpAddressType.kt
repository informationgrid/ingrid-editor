package de.ingrid.igeserver.profiles.uvp.types.address

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class UvpAddressType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {
    override val className = "UvpAddressDoc"
    override val profiles = arrayOf("uvp")

    override val category = DocumentCategory.ADDRESS.value

    override val referenceFieldInDocuments = "pointOfContact"

    val log = logger()

}
