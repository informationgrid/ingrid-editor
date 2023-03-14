package de.ingrid.igeserver.profiles.ingrid.types.address

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridPersonType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {
    override val className = "InGridPersonDoc"
    override val profiles = arrayOf("ingrid")

    override val category = DocumentCategory.ADDRESS.value

    override val referenceFieldInDocuments = "addresses"

    val log = logger()

}
