package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridDataCollectionType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridDataCollection"

//    override val jsonSchema = "/ingrid/schemes/approval-procedure.schema.json"
}
