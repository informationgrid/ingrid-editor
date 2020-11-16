package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

class DateSerializer : StdSerializer<OffsetDateTime>(OffsetDateTime::class.java) {

    override fun serialize(value: OffsetDateTime, generator: JsonGenerator, provider: SerializerProvider) {
        generator.writeString(value.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
    }
}