package de.ingrid.igeserver.profiles.sample.types

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class SampleOrganisationType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {
    override val className = "SampleOrganisationDoc"
    override val profiles = arrayOf("sample")
    override val referenceFieldsInDocuments = listOf("addresses")
}
