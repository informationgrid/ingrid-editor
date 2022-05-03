package de.ingrid.igeserver.profiles.uvp.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpApprovalProcedureType @Autowired constructor() : UvpBaseType() {
    override val className = "UvpApprovalProcedureDoc"

    override val jsonSchema = "/uvp/schemes/approval-procedure.schema.json"
}
