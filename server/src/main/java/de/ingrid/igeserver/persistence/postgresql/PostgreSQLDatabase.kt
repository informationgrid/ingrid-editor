package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.deser.BeanDeserializerModifier
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.ser.BeanSerializerModifier
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataSerializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataTypeRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import java.io.Closeable
import javax.persistence.EntityManager
import javax.persistence.TypedQuery
import kotlin.reflect.KClass
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Catalog as JpaCatalog

@Service
class PostgreSQLDatabase : DBApi {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var entityTypes: List<PostgreSQLEntityType>

    @Autowired
    private lateinit var embeddedDataTypes: EmbeddedDataTypeRegistry

    /**
     * Id of the catalog that is acquired on the current thread
     */
    private val currentCatalog = ThreadLocal<Int>()

    /**
     * Jackson mapper used for deserialization of incoming JSON strings
     */
    private val mapper: ObjectMapper by lazy {
        val mapper = jacksonObjectMapper()
        mapper.findAndRegisterModules()

        val module = SimpleModule()
        // register custom deserializer for embedded data
        module.setDeserializerModifier(object : BeanDeserializerModifier() {
            override fun modifyDeserializer(config: DeserializationConfig,
                                            beanDesc: BeanDescription,
                                            deserializer: JsonDeserializer<*>): JsonDeserializer<*> {
                return if (EntityWithEmbeddedData::class.java.isAssignableFrom(beanDesc.beanClass))
                    EmbeddedDataDeserializer(deserializer, embeddedDataTypes) else deserializer
            }
        })
        // register custom serializer for embedded data
        module.setSerializerModifier(object : BeanSerializerModifier() {
            override fun modifySerializer(config: SerializationConfig,
                                          beanDesc: BeanDescription,
                                          serializer: JsonSerializer<*>): JsonSerializer<*> {
                return if (EntityWithEmbeddedData::class.java.isAssignableFrom(beanDesc.beanClass))
                    EmbeddedDataSerializer(serializer) else serializer
            }
        })
        mapper.registerModule(module)
        mapper
    }

    /**
     * Mapping between entity types and implementing classes
     */
    private val entityTypeMap: Map<KClass<out EntityType>, PostgreSQLEntityType> by lazy {
        if (!::entityTypes.isInitialized) {
            throw PersistenceException.withReason("No entity types registered.")
        }
        val result: Map<KClass<out EntityType>, PostgreSQLEntityType> = mutableMapOf()
        entityTypes.forEach { t: PostgreSQLEntityType ->
            (result as MutableMap<KClass<out EntityType>, PostgreSQLEntityType>)[t.entityType] = t
        }
        result.toMap()
    }

    override fun <T : EntityType> getRecordId(type: KClass<T>, docUuid: String): String? {
        TODO("Not yet implemented")
    }

    override fun getRecordId(doc: JsonNode): String? {
        TODO("Not yet implemented")
    }

    override fun getVersion(doc: JsonNode): Int? {
        TODO("Not yet implemented")
    }

    override fun removeInternalFields(doc: JsonNode) {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode? {
        val typeImpl = getEntityTypeImpl(type)
        val result = entityManager.find(typeImpl.jpaType.java, id?.toInt())
        return if (result !== null) mapEntityToJson(result) else null
    }

    override fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode> {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> findAll(type: KClass<T>, query: List<QueryField>?, options: FindOptions): FindAllResults {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> countChildrenOfType(id: String, type: KClass<T>): Map<String, Long> {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String?): JsonNode {
        val typeImpl = getEntityTypeImpl(type)
        val existingEntity = if (id != null) entityManager.find(typeImpl.jpaType.java, id.toInt()) else null

        val persistedEntity = (if (existingEntity == null) {
            val entity = mapper.readValue(data, typeImpl.jpaType.java)
            (entity as? EntityWithCatalog)?.catalog = entityManager.getReference(JpaCatalog::class.java, currentCatalog.get())
            entity.id = null // prevent 'detached entity passed to persist' errors if the id is set already
            entityManager.persist(entity)
            entity
        } else {
            // merge json from existing entity with incoming data
            val existingData = mapper.readTree(mapper.writeValueAsString(existingEntity))
            val mergedData = mapper.writeValueAsString(mapper.readerForUpdating(existingData).readValue(data))
            val entity = mapper.readValue(mergedData, typeImpl.jpaType.java)
            (entity as? EntityWithCatalog)?.catalog = entityManager.getReference(JpaCatalog::class.java, currentCatalog.get())
            entityManager.merge(entity)
        }) as EntityBase

        // synchronize with database (e.g. update version attribute if existing)
        entityManager.flush()
        return mapEntityToJson(persistedEntity)
    }

    override fun <T : EntityType> remove(type: KClass<T>, id: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> remove(type: KClass<T>, query: Map<String, String>): Boolean {
        TODO("Not yet implemented")
    }

    override val databases: Array<String>
        get() = listOf<String>().toTypedArray()//TODO("Not yet implemented")

    override val currentDatabase: String?
        get() = TODO("Not yet implemented")

    override fun createCatalog(settings: Catalog): String? {
        TODO("Not yet implemented")
    }

    override fun updateCatalog(settings: Catalog) {
        TODO("Not yet implemented")
    }

    override fun removeCatalog(name: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun catalogExists(name: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun acquire(name: String): Closeable {
        // find the catalog by name
        val query: TypedQuery<JpaCatalog> = entityManager.createQuery("SELECT c FROM Catalog c WHERE c.identifier = :name", JpaCatalog::class.java)
        query.setParameter("name", name)
        val catalog = query.singleResult
        currentCatalog.set(catalog.id)

        // start a transaction that will be committed when closed
        return ClosableTransaction(transactionManager)
    }

    override fun beginTransaction() {
        TODO("Not yet implemented")
    }

    override fun commitTransaction() {
        TODO("Not yet implemented")
    }

    override fun rollbackTransaction() {
        TODO("Not yet implemented")
    }

    /**
     * Private interface
     */

    private fun <T : EntityType> getEntityTypeImpl(type: KClass<T>): PostgreSQLEntityType {
        return entityTypeMap[type] ?: throw PersistenceException.withReason("No entity type '$type' registered.")
    }

    private fun mapEntityToJson(obj: EntityBase): JsonNode {
        // NOTE this is not as optimized as mapper.valueToTree(obj), but allows to use serialization annotations
        return mapper.readTree(mapper.writeValueAsString(obj))
    }
}