/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
            "yyyy-MM-dd'T'HH:mm:ssXXX",   // ISO_OFFSET_DATE_TIME (e.g. 2011-12-03T10:15:30+01:00)
            "yyyy-MM-dd'T'HH:mmXXX"       // ISO_OFFSET_DATE_TIME without seconds (e.g. 2011-12-03T10:15+01:00)
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
