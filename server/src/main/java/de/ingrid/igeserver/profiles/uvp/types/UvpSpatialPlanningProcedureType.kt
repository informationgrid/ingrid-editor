package de.ingrid.igeserver.profiles.uvp.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpSpatialPlanningProcedureType() : UvpBaseType() {
    override val className = "UvpSpatialPlanningProcedureDoc"

    override val jsonSchema = "/uvp/schemes/spatial-or-line.schema.json"
}
