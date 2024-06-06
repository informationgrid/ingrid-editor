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
 * Status of the plan.
 */
enum class DocTypeEnum(val value: String) {
    FUNCTIONAL_PLAN("functionalPlan"),
    COST_ASSUMPTION_CONTRACT("costAssumptionContract"),
    URBAN_DEVELOPMENT_CONTRACT("urbanDevelopmentContract"),
    IMPLEMENTATION_CONTRACT("implementationContract"),
    PROPERTY_DEVELOPMENT_CONTRACT("propertyDevelopmentContract"),
    CONTRACT("contract"),
    EXPERT_REPORT("expertReport"),
    ROUGH_COORDINATION_PAPER("roughCoordinationPaper"),
    SUPPLEMENTARY_DOCUMENT("supplementaryDocument"),
    ORDINANCE_DESIGNATION("ordinanceDesignation"),
    COVER_LETTER("coverLetter"),
    COVER_LETTER_PARTICIPATION_PROCEDURE("coverLetterParticipationProcedure"),
    TRANSCRIPT("transcript"),
    SUMMARY_STATEMENT("summaryStatement"),
    FINAL_NOTICE("finalNotice"),
    PRELIMINARY_PLANNING_APPROVAL("preliminaryPlanningApproval"),
    DECISION_FOR_PUBLIC_DISPLAY("decisionForPublicDisplay"),
    DECLARATORY_DECISION("declaratoryDecision"),
    RESOLUTION_ON_REVOCATION("resolutionOnRevocation"),
    STATEMENT("statement"),
    PUBLICATION("publication"),
    PRINTED_MATTER("printedMatter"),
    PRESENTATION("presentation"),
    SUBSTANTIATION("substantiation"),
    INTERNAL_MEMO("internalMemo"),
    MEETING_DOCUMENTS("meetingDocuments"),
    OTHER_DOCUMENTS("otherDocuments"),
    ANNOUNCEMENT("announcement"),
    EXPLANATORY_REPORT("explanatoryReport"),
    PLAN_DRAWING("planDrawing"),
    PARTICIPATION_URL("participationURL"),
    PROCEDURE_URL("procedureURL"),
    XPLAN_ARCHIVE("xplanArchive"),
    XPLAN_GML("xplanGML"),
    UNKNOWN("unknown");

    class Converter : EnumConverter<DocTypeEnum>(
        DocTypeEnum::class.java
    )

    @JsonValue
    override fun toString(): String {
        return value.toString()
    }

    companion object {
        private const val uriPrefix = "https://specs.diplanung.de/resource/docType#"
        @JsonCreator
        fun fromValue(text: String?): DocTypeEnum? {
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
                Stream.of(*entries.toTypedArray()).map { anEnum: DocTypeEnum -> uriPrefix + anEnum.toString() }
                    .toList())
            throw IllegalArgumentException("DocTypeEnum value has to be one of [$enumValues], was $text")
        }

        private fun stripPrefix(uri: String): String {
            return uri.replaceFirst(uriPrefix.toRegex(), "")
        }
    }
}
