package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridLiteratureType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridLiterature"

    override val jsonSchema = "/ingrid/schemes/literature.schema.json"
}
