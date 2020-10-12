package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.deser.ResolvableDeserializer
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityWithEmbeddedData

/**
 * Jackson Deserializer used when mapping serialized instances of EntityWithEmbeddedData to entity instances.
 *
 * The concrete de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData implementation is derived from the "type"
 * JSON value which is used to match against the "typeColumnValue" property of all known EmbeddedData implementations.
 */
class EmbeddedDataDeserializer(
        val defaultDeserializer: JsonDeserializer<*>,
        private val embeddedDataTypes: EmbeddedDataTypeRegistry
) : StdDeserializer<EntityWithEmbeddedData>(EntityWithEmbeddedData::class.java), ResolvableDeserializer {

    companion object {
        private val embeddedDataMapper: ObjectMapper by lazy {
            val mapper = jacksonObjectMapper()
            mapper.findAndRegisterModules()
            mapper
        }
    }

    override fun deserialize(jp: JsonParser, ctxt: DeserializationContext): EntityWithEmbeddedData {
        // deserialize entity with default deserializer
        // NOTE unknown fields belong to embedded data and will be collected in the dataFields property
        val entity = defaultDeserializer.deserialize(jp, ctxt) as EntityWithEmbeddedData
        if (entity.type.isNullOrEmpty()) {
            throw PersistenceException.withReason("Could not deserialize entity with embedded data because 'type' parameter is missing: " +
                    "'${jp.currentLocation.sourceRef}'")
        }

        // deserialize embedded data from dataFields property
        val dataType = embeddedDataTypes.getType(entity.type!!)
        val serializedData = embeddedDataMapper.writeValueAsString(entity.dataFields)
        entity.data = embeddedDataMapper.readValue(serializedData, dataType.java) as EmbeddedData

        return entity
    }

    override fun resolve(ctxt: DeserializationContext) {
        (defaultDeserializer as ResolvableDeserializer).resolve(ctxt)
    }
}