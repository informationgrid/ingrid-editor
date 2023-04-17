package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import net.pwall.json.schema.JSONSchema
import net.pwall.json.schema.output.BasicOutput
import org.apache.logging.log4j.LogManager
import org.springframework.stereotype.Component
import org.unbescape.json.JsonEscape

@Component
class PreJsonSchemaValidator : Filter<PrePublishPayload> {

    companion object {
        private val log = LogManager.getLogger()
    }

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

    fun validate(schemaFile: String, json: String): BasicOutput? {
        val resource = PreJsonSchemaValidator::class.java.getResource(schemaFile)

        if (resource == null) {
            log.error("JSON-Schema not found: $schemaFile")
            return null
        }

        val schema = JSONSchema.parseFile(resource.file)
        val output = schema.validateBasic(json)
        log.debug("Document valid: ${output.valid}")
        output.errors?.forEach {
            log.error("${it.error} - ${it.instanceLocation}")
        }

        if (!output.valid) {
            throw ValidationException.withReason(output.errors)
        }

        return output
    }
}
