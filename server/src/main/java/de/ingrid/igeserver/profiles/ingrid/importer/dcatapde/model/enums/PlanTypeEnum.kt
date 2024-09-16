/**
 * ==================================================
 * Copyright (C) 2022-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import java.util.stream.Stream

/**
 * Type of the spatial plan.
 */
enum class PlanTypeEnum(val value: String) {
    DEVELOPMENT_PLAN("developmentPlan"),
    LAND_USE_PLAN("landUsePlan"),
    URBAN_PLANNING_STATUSES("urbanPlanningStatutes"),
    SPECIAL_URBAN_PLANNING_LAW("specialUrbanPlanningLaw"),
    LANDSCAPE_PLANNING("landscapePlanning"),
    SPATIAL_PLAN("spatialPlan"),
    SPATIAL_PLANNING_PROCEDURE("spatialPlanningProcedure"),
    PLAN_APPROVAL_PROCEDURE("planApprovalProcedure"),
    OTHER("other"),
    UNKNOWN("unknown"),
    ;

    class Converter :
        EnumConverter<PlanTypeEnum>(
            PlanTypeEnum::class.java,
        )

    @JsonValue
    override fun toString(): String = value.toString()

    companion object {
        private const val URI_PREFIX = "https://specs.diplanung.de/resource/planType#"

        @JsonCreator
        fun fromValue(text: String?): PlanTypeEnum? {
            if (text == null) {
                return null
            }
            for (b in entries) {
                if (b.value.toString() == stripPrefix(text)) {
                    return b
                }
            }
            val enumValues = java.lang.String.join(
                ", ",
                Stream.of(*entries.toTypedArray()).map { anEnum: PlanTypeEnum -> URI_PREFIX + anEnum.toString() }
                    .toList(),
            )
            throw IllegalArgumentException("PlanTypeEnum value has to be one of [$enumValues], was $text")
        }

        private fun stripPrefix(uri: String): String = uri.replaceFirst(URI_PREFIX.toRegex(), "")
    }
}
