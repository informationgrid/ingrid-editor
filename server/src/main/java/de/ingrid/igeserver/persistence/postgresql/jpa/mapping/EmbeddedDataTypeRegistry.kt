package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class EmbeddedDataTypeRegistry  {

    @Autowired
    private lateinit var types: List<EmbeddedData>

    // mapping between embedded data type names and implementing classes
    private val typeMap: Map<String, EmbeddedData> by lazy {
        if (!::types.isInitialized) {
            throw PersistenceException.withReason("No embedded data types registered.")
        }
        val result: Map<String, EmbeddedData> = mutableMapOf()
        types.forEach { t: EmbeddedData ->
            (result as MutableMap<String, EmbeddedData>)[t.typeColumnValue] = t
        }
        result.toMap()
    }

    private val log = logger()

    fun getType(type: String?): EmbeddedData {
        if (type == null || !typeMap.containsKey(type)) {
            log.debug("No EmbeddedData implementation found for type $type. Falling back to EmbeddedMap implementation.")
        }
        return if (type != null) typeMap.getOrDefault(type, EmbeddedMap()) else EmbeddedMap()
    }
}