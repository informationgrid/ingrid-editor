package de.ingrid.igeserver.profiles.uvp.types.address

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.LogManager
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class UvpOrganisationType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {
    override val className = "UvpOrganisationDoc"
    override val profiles = arrayOf("uvp")

    override val category = DocumentCategory.ADDRESS.value

    override val referenceFieldInDocuments = "pointOfContact"

    companion object {
        private val log = LogManager.getLogger()
    }
}
