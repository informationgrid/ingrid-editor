package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData

/**
 * Jackson Serializer used when mapping instances of EntityWithEmbeddedData to strings.
 */
class EmbeddedDataSerializer(
        val defaultSerializer: JsonSerializer<*>
) : StdSerializer<EntityWithEmbeddedData<*>>(EntityWithEmbeddedData::class.java) {

    companion object {
        private val defaultMapper: ObjectMapper by lazy {
            val mapper = jacksonObjectMapper()
            mapper.findAndRegisterModules()
            mapper
        }
    }

    override fun serialize(value: EntityWithEmbeddedData<*>, gen: JsonGenerator, provider: SerializerProvider) {
        val node: ObjectNode = defaultMapper.valueToTree(value)
        val data = node.remove("data")
        data.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        gen.writeTree(node)
    }
}