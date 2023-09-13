package de.ingrid.igeserver.schema

import de.ingrid.igeserver.persistence.filter.publish.PreJsonSchemaValidator
import net.pwall.json.schema.output.BasicOutput

class SchemaUtils {

    companion object {
        fun extractMissingRequiredFields(result: BasicOutput) = result.errors
            ?.filter { it.error.indexOf("Required property") == 0 }
            ?.map { it.error.substring(IntRange(it.error.indexOf("\"") + 1, it.error.lastIndexOf("\"") - 1)) }!!

        fun validate(json: String, schema: String) = PreJsonSchemaValidator().validate(schema, json)!!

        fun getJsonFileContent(file: String) = this::class.java.getResource(file)!!.readText(Charsets.UTF_8).replace("\r\n", "\n")
    }

}
