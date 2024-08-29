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
package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.model.KeyValue

@JsonIgnoreProperties(ignoreUnknown = true)
data class TimeSpanModel(
    val rangeType: KeyValue?,
    val timeSpanDate: String?,
    val timeSpanRange: RangeModel?,
) {

    val start: String?
        get() {
            when (rangeType?.key) {
                "at" -> return timeSpanDate
                "since" -> return timeSpanDate
                "till" -> return null
                "range" -> return timeSpanRange?.start
            }
            return null
        }
    val end: String?
        get() {
            when (rangeType?.key) {
                "at" -> return timeSpanDate
                "since" -> return null
                "till" -> return timeSpanDate
                "range" -> return timeSpanRange?.end
            }
            return null
        }
}
