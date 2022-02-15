package de.ingrid.igeserver.profiles.uvp.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpForeignProjectType @Autowired constructor(val docService: DocumentService) : EntityType() {
    override val className = "UvpForeignProjectDoc"
    override val profiles = arrayOf("uvp")

    val log = logger()
}
