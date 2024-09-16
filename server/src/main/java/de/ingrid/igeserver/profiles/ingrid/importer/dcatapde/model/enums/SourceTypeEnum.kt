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

import java.util.*
import java.util.stream.Stream

enum class SourceTypeEnum(val value: String) {
    K1("cockpit"),
    K3("beteiligungsdb"),
    CSW("csw"),
    WFS("wfs"),
    ;

    companion object {
        fun fromValue(source: String?): SourceTypeEnum? {
            var source = source ?: return null
            source = source.lowercase(Locale.getDefault())
            if (source.contains("cockpit")) {
                return K1
            }

            // TODO legacy support; remove when data has been amended
            if (source.contains("ogcrecordsapi")) {
                return K1
            }

            // --
            if (source.contains("beteiligung")) {
                return K3
            }
            if (source.contains("csw")) {
                return CSW
            }
            if (source.contains("wfs")) {
                return WFS
            }
            val enumValues = java.lang.String.join(
                ", ",
                Stream.of(*entries.toTypedArray()).map { anEnum: SourceTypeEnum -> anEnum.toString() }
                    .toList(),
            )
            throw IllegalArgumentException("SourceTypeEnum value has to be one of [$enumValues], was $source")
        }
    }
}
