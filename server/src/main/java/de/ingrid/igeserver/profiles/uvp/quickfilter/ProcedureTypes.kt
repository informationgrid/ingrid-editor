/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
        "UvpNegativePreliminaryAssessmentDoc",
        "UvpApprovalProcedureDoc",
        "UvpSpatialPlanningProcedureDoc",
        "UvpLineDeterminationDoc",
        "UvpForeignProjectDoc",
    )
}
