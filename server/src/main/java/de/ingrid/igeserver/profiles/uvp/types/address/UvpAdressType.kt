package de.ingrid.igeserver.profiles.uvp.types.address

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component

@Component
class UvpAdressType : EntityType() {
    override val className = "UvpAddressDoc"
    override val profiles = arrayOf("uvp")

    override val category = DocumentCategory.ADDRESS.value

    val log = logger()

}
