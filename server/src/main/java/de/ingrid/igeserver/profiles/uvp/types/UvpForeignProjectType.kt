package de.ingrid.igeserver.profiles.uvp.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpForeignProjectType() : UvpBaseType() {
    override val className = "UvpForeignProjectDoc"

    override val jsonSchema = "/uvp/schemes/foreign-project.schema.json"
}
