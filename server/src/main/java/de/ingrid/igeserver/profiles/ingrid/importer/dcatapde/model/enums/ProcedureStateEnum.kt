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
 * Status of the procedure.
 */
enum class ProcedureStateEnum(val value: String) {
    PLANNED("planned"),
    ONGOING("ongoing"),
    COMPLETED("completed"),
    UNKNOWN("unknown");

    class Converter : EnumConverter<ProcedureStateEnum>(
        ProcedureStateEnum::class.java
    )

    @JsonValue
    override fun toString(): String {
        return value.toString()
    }

    companion object {
        private const val uriPrefix = "https://specs.diplanung.de/resource/procedureState#"
        @JsonCreator
        fun fromValue(text: String?): ProcedureStateEnum? {
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
                Stream.of(*entries.toTypedArray()).map { anEnum: ProcedureStateEnum -> uriPrefix + anEnum.toString() }
                    .toList())
            throw IllegalArgumentException("ProcedureStateEnum value has to be one of [$enumValues], was $text")
        }

        private fun stripPrefix(uri: String): String {
            return uri.replaceFirst(uriPrefix.toRegex(), "")
        }
    }
}
