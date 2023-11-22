package de.ingrid.igeserver.profiles.uvp.types

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpNegativePreliminaryAssessmentType() : UvpBaseType() {
    override val className = "UvpNegativePreliminaryAssessmentDoc"

    override val jsonSchema = "/uvp/schemes/negative-preliminary-assessment.schema.json"

}
