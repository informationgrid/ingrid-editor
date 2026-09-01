/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.persistence.filter.publish

import com.networknt.schema.Error
import com.networknt.schema.InputFormat
import com.networknt.schema.SchemaLocation
import com.networknt.schema.SchemaRegistry
import com.networknt.schema.dialect.Dialects
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import org.apache.commons.text.StringEscapeUtils.escapeJson
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import tools.jackson.databind.node.ObjectNode

data class JsonErrorEntry(
    val error: String,
    val instanceLocation: String,
)

@Component
class PreJsonSchemaValidator : Filter<PrePublishPayload> {

    val log = logger()

    override val profiles: Array<String>
        get() = emptyArray()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        if (payload.skipValidation) {
            return payload
        }
        val schema = payload.type.jsonSchema
        if (schema != null) {
            val json = payload.document.data

            // add title to json, which isn't part of the data field
            val jsonWithTitle = addGenericFields(json, payload)

            validate(
                schema,
                jsonWithTitle,
            )
        }
        return payload
    }

    private fun addGenericFields(
        json: ObjectNode,
        payload: PrePublishPayload,
    ): String {
        var extraFields = if (json.isEmpty) "" else ","
        extraFields += """"title": "${escapeJson(payload.document.title)}""""
        if (!json.has("_type")) {
            extraFields += ""","_type": "${escapeJson(payload.document.type)}""""
        }
        if (!json.has("_uuid")) {
            extraFields += ""","_uuid": "${escapeJson(payload.document.uuid)}""""
        }
        return json.toString().substringBeforeLast("}") + extraFields + "}"
    }

    fun validate(schemaFile: String, json: String): Set<Error> {
        val resource = PreJsonSchemaValidator::class.java.getResource(schemaFile)

        if (resource == null) {
            log.error("JSON-Schema not found: $schemaFile")
            return emptySet()
        }

        val schemaLocation = SchemaLocation.of("classpath:$schemaFile")

        val schemaRegistry = SchemaRegistry.withDialect(Dialects.getDraft202012()) { builder ->
            builder.schemas(mapOf("https://wemove.com/schemas/" to "classpath:/"))
            builder
                .nodeReader { reader -> reader.locationAware() }
                // 2. Allow the classpath prefix pattern through the library sandbox
                .schemaLoader { loader ->
                    loader.allow { iri -> iri.toString().startsWith("classpath:") }
                }
        }

        val schema1 = schemaRegistry.getSchema(schemaLocation)
        val assertions: List<Error> = schema1.validate(json, InputFormat.JSON)

        if (assertions.isNotEmpty()) {
            // map to prevent leaking of information about server in absoluteKeywordLocation (#5772)
            log.error("JSON-Schema validation errors: ${assertions.joinToString { it.message }}")
            val error = assertions.map { JsonErrorEntry(it.toString(), it.instanceLocation.toString()) }
            throw ValidationException.withReason(error)
        }
        return assertions.toSet()
    }
}
