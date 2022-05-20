package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class ProcedureTypes : QuickFilter() {
    override val id = "selectProcedureType"
    override val label = ""
    override val filter = "document1.type = ?"
    override val parameters = listOf(
        "UvpSpatialPlanningProcedureDoc", "UvpNegativePreliminaryAssessmentDoc", "UvpLineDeterminationDoc",
        "UvpForeignProjectDoc", "UvpApprovalProcedureDoc"
    )
}