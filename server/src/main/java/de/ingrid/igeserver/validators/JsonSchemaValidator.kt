package de.ingrid.igeserver.validators

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import de.ingrid.igeserver.services.DocumentService
import net.pwall.json.schema.JSONSchema
import net.pwall.json.schema.output.BasicOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
class JsonSchemaValidator @Autowired constructor(
    @Lazy private val documentService: DocumentService
) : Filter<PrePublishPayload> {

    val log = logger()

    override val profiles: Array<String>
        get() = emptyArray()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val schema = payload.type.jsonSchema
        if (schema != null) {
            // TODO: move function to utilities to prevent cycle
            val json = documentService.convertToJsonNode(payload.document).toString()
            validate(schema, json)
        }
        return payload
    }

    fun validate(schemaFile: String, json: String): BasicOutput? {
        val resource = JsonSchemaValidator::class.java.getResource(schemaFile)

        if (resource == null) {
            log.error("JSON-Schema not found: $schemaFile")
            return null
        }

        val schemaContent = resource.readText()

        val schema = JSONSchema.parse(schemaContent)
        val output = schema.validateBasic(json)
        log.debug("Document valid: ${output.valid}")
        output.errors?.forEach {
            log.error("${it.error} - ${it.instanceLocation}")
        }
        return output
    }
}
