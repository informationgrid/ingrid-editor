/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.utils

import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

object DateHelper {

    private val OUTPUT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

    @JvmStatic
    fun normalizeToUtc(dateTime: String?): String? {
        if (dateTime.isNullOrBlank()) return null
        val parsed = try {
            OffsetDateTime.parse(dateTime)
        } catch (e: DateTimeParseException) {
            try {
                LocalDate.parse(dateTime).atStartOfDay(ZoneId.of("Europe/Berlin")).toOffsetDateTime()
            } catch (e2: DateTimeParseException) {
                return null
            }
        }
        val utc = parsed.withOffsetSameInstant(ZoneOffset.UTC)
        return utc.format(OUTPUT_FORMAT)
    }
}
