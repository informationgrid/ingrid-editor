package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class ProcedureTypes : QuickFilter() {
    override val id = "selectProcedureType"
    override val label = ""
    override val filter: String = ""

    override fun filter(parameter: List<*>?) = "document1.type = '${parameter?.get(0)}'"
    override val parameters = listOf(
        "UvpNegativePreliminaryAssessmentDoc", "UvpApprovalProcedureDoc", "UvpSpatialPlanningProcedureDoc",
        "UvpLineDeterminationDoc", "UvpForeignProjectDoc",
    )
}
