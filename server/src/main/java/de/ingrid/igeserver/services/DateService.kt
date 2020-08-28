package de.ingrid.igeserver.services

import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class DateService {

    fun now(): OffsetDateTime {
        return OffsetDateTime.now()
    }
}