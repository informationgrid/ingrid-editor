package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase

/**
 * Jackson Serializer used when mapping instances of EntityBase to strings.
 */
class EntitySerializer(
        val defaultSerializer: JsonSerializer<*>,
        private val dbServiceMapper: ObjectMapper,
        private val resolveReferences: Boolean
) : StdSerializer<EntityBase>(EntityBase::class.java) {

    companion object {
        private val defaultMapper: ObjectMapper by lazy {
            val mapper = jacksonObjectMapper()
            mapper.findAndRegisterModules()
            mapper
        }
    }

    override fun serialize(value: EntityBase, gen: JsonGenerator, provider: SerializerProvider) {
        val node: ObjectNode = defaultMapper.valueToTree(value)

        // unwrap data into root properties if requested
        if (value is EntityWithEmbeddedData<*> && value.unwrapData) {
            val data = node.remove("data")
            data.fields().forEach { entry ->
                node.replace(entry.key, entry.value)
            }
        }

        // resolve related objects if requested
        value.updateSerializedRelations(node, dbServiceMapper, resolveReferences)

        gen.writeTree(node)
    }
}