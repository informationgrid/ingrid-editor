package de.ingrid.igeserver.profiles.ingrid.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class InGridGeoServiceType @Autowired constructor() : InGridBaseType() {
    override val className = "InGridGeoService"

    override val jsonSchema = "/ingrid/schemes/geo-service.schema.json"
}
