package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class EmbeddedDataTypeRegistry {

    @Autowired
    private lateinit var types: List<EmbeddedData>

    // mapping between embedded data type names and implementing classes
    private val typeMap: Map<String, KClass<out Any>> by lazy {
        if (!::types.isInitialized) {
            throw PersistenceException.withReason("No embedded data types registered.")
        }
        val result: Map<String, KClass<out Any>> = mutableMapOf()
        types.forEach { t: EmbeddedData ->
            (result as MutableMap<String, KClass<out Any>>)[t.typeColumnValue] = t::class
        }
        result.toMap()
    }

    private val log = logger()

    fun getType(type: String): KClass<out Any> {
        if (!typeMap.containsKey(type)) {
            log.warn("No EmbeddedData implementation found for type $type. Falling back to EmbeddedMap implementation.")
        }
        return typeMap.getOrDefault(type, EmbeddedMap::class)
    }
}