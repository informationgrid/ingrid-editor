package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

class DateDeserializer @JvmOverloads constructor(vc: Class<*>? = null) : StdDeserializer<OffsetDateTime?>(vc) {

    companion object {
        private val DATE_FORMATS = arrayOf(
            "yyyy-MM-dd'T'HH:mm:ss.nXXX", // ISO_OFFSET_DATE_TIME with nano seconds (e.g. 2020-11-03T10:23:10.028062900+01:00)
            "yyyy-MM-dd'T'HH:mm:ssXXX"    // ISO_OFFSET_DATE_TIME (e.g. 2011-12-03T10:15:30+01:00)
        )
    }

    override fun deserialize(jp: JsonParser, ctxt: DeserializationContext?): OffsetDateTime {
        val node: JsonNode = jp.codec.readTree(jp)
        val date: String = node.textValue()
        for (format in DATE_FORMATS) {
            try {
                return OffsetDateTime.parse(date, DateTimeFormatter.ofPattern(format))
            }
            catch (e: Exception) {}
        }
        throw JsonParseException(jp, "Unparseable date: '$date'. Supported formats: ${DATE_FORMATS.contentToString()}.")
    }
}