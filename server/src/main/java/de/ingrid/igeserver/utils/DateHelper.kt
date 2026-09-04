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
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatterBuilder
import java.time.format.DateTimeParseException

object DateHelper {

    private val OUTPUT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private val GERMANY_ZONE = ZoneId.of("Europe/Berlin")

    private val PARSER = DateTimeFormatterBuilder()
        .appendOptional(DateTimeFormatter.ISO_DATE_TIME)
        .appendOptional(DateTimeFormatter.ISO_DATE)
        .toFormatter()

    @JvmStatic
    fun normalizeToUtc(dateTime: String?): String? {
        if (dateTime.isNullOrBlank()) return null

        val temporal = try {
            PARSER.parseBest(dateTime, OffsetDateTime::from, LocalDateTime::from, LocalDate::from)
        } catch (e: DateTimeParseException) {
            throw IllegalArgumentException("Unable to parse date: $dateTime", e)
        }

        val parsed = when (temporal) {
            is OffsetDateTime -> temporal
            is LocalDateTime -> temporal.atZone(GERMANY_ZONE).toOffsetDateTime()
            is LocalDate -> temporal.atStartOfDay(GERMANY_ZONE).toOffsetDateTime()
            else -> throw IllegalArgumentException("Unable to parse date: $dateTime")
        }

        val utc = parsed.withOffsetSameInstant(ZoneOffset.UTC)
        return utc.format(OUTPUT_FORMAT)
    }
}
