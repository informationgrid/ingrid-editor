package de.ingrid.igeserver.profiles.sample.types

import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.stereotype.Component

@Component
class SampleDocumentType : EntityType() {
    override val className = "SampleDoc"
    override val profiles = arrayOf("sample")
//    override val jsonSchema = "/sample/schemes/sample.schema.json"
}
