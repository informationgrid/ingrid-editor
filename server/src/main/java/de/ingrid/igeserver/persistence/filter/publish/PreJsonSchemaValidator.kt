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
package de.ingrid.igeserver.persistence.filter.publish

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import net.pwall.json.schema.JSONSchema
import net.pwall.json.schema.parser.Parser
import net.pwall.json.schema.output.BasicOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import org.unbescape.json.JsonEscape
import org.json.simple.JSONObject
import org.json.simple.JSONArray
import org.json.simple.parser.JSONParser
import java.io.File

data class JsonErrorEntry(
    val error: String,
    val instanceLocation: String
)

@Component
class PreJsonSchemaValidator : Filter<PrePublishPayload> {

    val log = logger()

    override val profiles: Array<String>
        get() = emptyArray()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val schema = payload.type.jsonSchema
        if (schema != null) {
            val json = payload.document.data

            // add title to json, which isn't part of the data field
            val jsonWithTitle = addGenericFields(json, payload)

            validate(
                schema,
                jsonWithTitle
            )
        }
        return payload
    }

    private fun addGenericFields(
        json: ObjectNode,
        payload: PrePublishPayload
    ): String {
        // TODO AW: remove after separation of metadata is complete (also check import with publication!)
        var extraFields = ""","title": "${JsonEscape.escapeJson(payload.document.title)}""""
        if (!json.has("_type")) {
            extraFields += ""","_type": "${JsonEscape.escapeJson(payload.document.type)}""""
        }
        if (!json.has("_uuid")) {
            extraFields += ""","_uuid": "${JsonEscape.escapeJson(payload.document.uuid)}""""
        }
        return json.toString().substringBeforeLast("}") + extraFields + "}"
    }

    fun validate(schemaFile: String, json: String): BasicOutput? {
        val resource = PreJsonSchemaValidator::class.java.getResource(schemaFile)

        if (resource == null) {
            log.error("JSON-Schema not found: $schemaFile")
            return null
        }

        val schema = enrichSchemaWithConditions(resource.file) ?: JSONSchema.parseFile(resource.file)
        val output = schema.validateBasic(json)
        log.debug("Document valid: ${output.valid}")
        output.errors?.forEach {
            log.error("${it.error} - ${it.instanceLocation}")
        }

        if (!output.valid) {
            // map to prevent leaking of information about server in absoluteKeywordLocation (#5772)
            val error = output.errors?.map { JsonErrorEntry(it.error, it.instanceLocation) }
            throw ValidationException.withReason(error)
        }

        return output
    }

    private fun loadSchemaAsJsonObject(filePath: String): JSONObject {
        val file = File(filePath)
        val content = file.readText()
        val parser = JSONParser()
        return parser.parse(content) as JSONObject
    }
    private fun enrichSchemaWithConditions(resourceFile: String): JSONSchema? {
        val resourceJson = loadSchemaAsJsonObject(resourceFile)
        val schemaType = resourceJson["\$ref"].toString().substringAfterLast("/")

        val conditionsFile = PreJsonSchemaValidator::class.java.getResource("/conditions.schema.json")
        if (conditionsFile == null) {
            log.error("JSON-Schema of validation conditions not found: /conditions.schema.json")
            return null
        }

        val conditionSchema = loadSchemaAsJsonObject(conditionsFile.file)
        val conditions = (conditionSchema["schemaType"] as JSONObject)[schemaType]

        return if (conditions == null) null else {
            val conditionsAsString = conditions.toString()
            val parser = JSONParser()
            val newConditionObject = parser.parse(conditionsAsString)
            val newSchema = loadSchemaAsJsonObject(resourceFile)
            val definitions = newSchema["definitions"] as JSONObject
            (definitions[schemaType] as JSONObject).putIfAbsent("allOf", JSONArray())
            val conditionsArray = (definitions[schemaType] as JSONObject)["allOf"] as JSONArray
            conditionsArray.addAll((newConditionObject as JSONObject)["allOf"] as JSONArray)
            val schemaString = newSchema.toJSONString() // Convert JSONObject to String
            val baseUri = File(resourceFile).toURI() // Get base URI so schema references can be handled
            Parser().parse(schemaString, baseUri) // convert JSONObject to JSONSchema
        }
    }

}
