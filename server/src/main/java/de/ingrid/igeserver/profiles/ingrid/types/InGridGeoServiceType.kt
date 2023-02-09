package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridGeoServiceType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridGeoService"

//    override val jsonSchema = "/ingrid/schemes/approval-procedure.schema.json"
}
