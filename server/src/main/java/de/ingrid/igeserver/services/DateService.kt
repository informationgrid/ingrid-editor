package de.ingrid.igeserver.services

import org.springframework.stereotype.Component
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

@Component
class DateService {

    fun now(): OffsetDateTime {
        return OffsetDateTime.now()
    }

    fun toISO8601UTC(date: Date?): String? {
        val tz: TimeZone = TimeZone.getTimeZone("UTC")
        val df: DateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'")
        df.setTimeZone(tz)
        return df.format(date)
    }
}
