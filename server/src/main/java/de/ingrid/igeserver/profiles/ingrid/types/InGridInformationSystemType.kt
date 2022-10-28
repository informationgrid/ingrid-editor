package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridInformationSystemType @Autowired constructor() : EntityType() {
    override val profiles = arrayOf("ingrid")
    
    override val className = "InGridInformationSystem"

//    override val jsonSchema = "/ingrid/schemes/approval-procedure.schema.json"
}
