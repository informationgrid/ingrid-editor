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
 * Type of the procedure for the setup of spatial plans.
 */
enum class ProcedureTypeEnum(val value: String) {
    REGULAR("regular"),
    SIMPLIFIED("simplified"),
    INNER_DEV_PLAN("innerDevPlan"),
    OURDOOR_AREA("outdoorArea"),
    REVISION("revision"),
    PARTIAL_EXTRAPOLATION("partialExtrapolation"),
    NEW_PREPARATION("newPreparation"),
    COMPLETE_EXTRAPOLATION("completeExtrapolation"),
    UPDATE("update"),
    NEW_ANNOUNCEMENT("newAnnouncement"),
    UNKNOWN("unknown"),
    ;

    class Converter :
        EnumConverter<ProcedureTypeEnum>(
            ProcedureTypeEnum::class.java,
        )

    @JsonValue
    override fun toString(): String = value.toString()

    companion object {
        private const val URI_PREFIX = "https://specs.diplanung.de/resource/procedureType#"

        @JsonCreator
        fun fromValue(text: String?): ProcedureTypeEnum? {
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
                Stream.of(*entries.toTypedArray()).map { anEnum: ProcedureTypeEnum -> URI_PREFIX + anEnum.toString() }
                    .toList(),
            )
            throw IllegalArgumentException("ProcedureTypeEnum value has to be one of [$enumValues], was $text")
        }

        private fun stripPrefix(uri: String): String = uri.replaceFirst(URI_PREFIX.toRegex(), "")
    }
}
