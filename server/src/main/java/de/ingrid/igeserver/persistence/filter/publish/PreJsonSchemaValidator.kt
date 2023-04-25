package de.ingrid.igeserver.persistence.filter.publish

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.github.fge.jsonschema.core.report.LogLevel
import com.github.fge.jsonschema.main.JsonSchemaFactory
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import org.unbescape.json.JsonEscape


@Component
class PreJsonSchemaValidator : Filter<PrePublishPayload> {

    val log = logger()

    override val profiles: Array<String>
        get() = emptyArray()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val schema = payload.type.jsonSchema
        if (schema != null) {
            val json = payload.document.data.toString()

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
        json: String,
        payload: PrePublishPayload
    ): String {
        val extraFields = """
            ,
            "title": "${JsonEscape.escapeJson(payload.document.title)}",
            "_type": "${JsonEscape.escapeJson(payload.document.type)}",
            "_uuid": "${JsonEscape.escapeJson(payload.document.uuid)}"
        """.trimIndent()
        return json.substringBeforeLast("}") + extraFields + "}"
    }

    fun validate(schemaFile: String, json: String) {
        val resource = PreJsonSchemaValidator::class.java.getResource(schemaFile)

        if (resource == null) {
            log.error("JSON-Schema not found: $schemaFile")
            return
        }

        val result = JsonSchemaFactory.byDefault()
            .getJsonSchema(resource.toString())
            .validate(jacksonObjectMapper().readTree(json))
        val errors = result
            .filter { it.logLevel == LogLevel.ERROR }
            .map { with(it.asJson()) { "${get("instance").get("pointer").asText()}: ${get("message").asText()}" } }

        log.debug("Document valid: ${result.isSuccess}")
        errors.forEach { log.error(it) }

        if (!result.isSuccess) {
            throw ValidationException.withReason(errors)
        }
    }
}
