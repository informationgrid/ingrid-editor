package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.deser.ResolvableDeserializer
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import org.apache.logging.log4j.kotlin.logger

/**
 * Jackson Deserializer used when mapping serialized instances of EntityWithEmbeddedData to entity instances.
 *
 * The concrete de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData implementation is derived from the "type"
 * JSON value which is used to match against the "typeColumnValue" property of all known EmbeddedData implementations.
 */
class EmbeddedDataDeserializer(
        val defaultDeserializer: JsonDeserializer<*>,
        private val embeddedDataTypes: EmbeddedDataTypeRegistry
) : StdDeserializer<EntityWithEmbeddedData<EmbeddedData>>(EntityWithEmbeddedData::class.java), ResolvableDeserializer {

    companion object {
        private val embeddedDataMapper: ObjectMapper by lazy {
            val mapper = jacksonObjectMapper()
            mapper.findAndRegisterModules()
            mapper
        }
    }

    private val log = logger()

    override fun deserialize(jp: JsonParser, ctxt: DeserializationContext): EntityWithEmbeddedData<EmbeddedData> {
        // deserialize entity with default deserializer
        // NOTE unknown fields belong to embedded data and will be collected in the dataFields property
        @Suppress("UNCHECKED_CAST")
        val entity = defaultDeserializer.deserialize(jp, ctxt) as EntityWithEmbeddedData<EmbeddedData>

        // deserialize embedded data from dataFields property
        if (entity.unwrapData) {
            if (entity.type.isNullOrEmpty()) {
                // fallback to EmbeddedMap
                log.debug("Did not find 'type' parameter in '${jp.currentLocation.sourceRef}'. Deserializing embedded data into map.")
            }
            val dataType = embeddedDataTypes.getType(entity.type)
            val serializedData = embeddedDataMapper.writeValueAsString(entity.dataFields)
            entity.data = embeddedDataMapper.readValue(serializedData, dataType::class.java) as EmbeddedData
        }

        return entity
    }

    override fun resolve(ctxt: DeserializationContext) {
        (defaultDeserializer as ResolvableDeserializer).resolve(ctxt)
    }
}