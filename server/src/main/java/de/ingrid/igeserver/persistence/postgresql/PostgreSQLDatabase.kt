package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.*
import com.fasterxml.jackson.databind.deser.BeanDeserializerModifier
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.ser.BeanSerializerModifier
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataSerializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataTypeRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithRecordId
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.services.FIELD_VERSION
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.metamodel.spi.MetamodelImplementor
import org.hibernate.persister.entity.AbstractEntityPersister
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import java.io.Closeable
import java.math.BigInteger
import javax.persistence.EntityManager
import kotlin.reflect.KClass
import kotlin.reflect.full.isSubclassOf
import kotlin.reflect.full.memberProperties

@Service
class PostgreSQLDatabase : DBApi {

    companion object {
        private const val DB_ID = "db_id"
        private const val DB_VERSION = "db_version"

        private val INTERNAL_FIELDS = listOf(DB_ID, DB_VERSION)
    }

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
    private val catalogId = ThreadLocal<Int?>()

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

    private val log = logger()

    override fun <T : EntityType> getRecordId(type: KClass<T>, docId: String): String? {
        val typeImpl = getEntityTypeImpl(type)
        if (typeImpl.idAttribute == null) {
            throw PersistenceException.withReason("Entity type '$type' does not define an id attribute.")
        }
        // the record id can only be determined if type has a record id
        return if (typeImpl.jpaType.isSubclassOf(EntityWithRecordId::class)) {
            val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e WHERE e.${typeImpl.idAttribute} = :docId"
            val entities = entityManager.createQuery(queryStr, typeImpl.jpaType.java).
                    setParameter("docId", docId).resultList
            if (entities.size == 1) {
                (entities[0] as EntityWithRecordId).id?.toString()
            } else {
                throw PersistenceException.withMultipleEntities(docId, type.simpleName, currentCatalog)
            }
        } else null
    }

    override fun getRecordId(doc: JsonNode): String? {
        return doc[DB_ID]?.asText()
    }

    override fun removeInternalFields(doc: JsonNode) {
        val objNode = doc as ObjectNode

        val version = if (doc.hasNonNull(DB_VERSION)) doc[DB_VERSION].intValue() else null
        if (version != null) {
            objNode.put(FIELD_VERSION, version.toString())
        }

        INTERNAL_FIELDS.forEach {
            objNode.remove(it)
        }
    }

    override fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode? {
        val typeImpl = getEntityTypeImpl(type)
        val result = entityManager.find(typeImpl.jpaType.java, id?.toInt())
        return if (result !== null) mapEntityToJson(result) else null
    }

    override fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode> {
        val typeImpl = getEntityTypeImpl(type)

        val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e"
        return entityManager.createQuery(queryStr, typeImpl.jpaType.java).resultList.map { mapEntityToJson(it) }
    }

    override fun <T : EntityType> findAll(type: KClass<T>, query: List<QueryField>?, options: FindOptions): FindAllResults {
        val typeImpl = getEntityTypeImpl(type)

        // create an entity and count query
        // NOTE we need to use a native query to use jsonb operators
        val tableName = getTableName(typeImpl.jpaType)
        var queryStr = "SELECT * FROM $tableName"
        var countQueryStr = "SELECT count(*) as count FROM $tableName"

        // process query criteria
        var criteria: Map<String, Any?>? = null
        if (!query.isNullOrEmpty()) {
            criteria = processCriteria(typeImpl.jpaType, query, options)
            val whereString = criteria.keys.joinToString(separator = " ${options.queryOperator} ") { it }
            if (!options.sortField.isNullOrEmpty()) {
                queryStr += " LET \$temp = max( draft.${options.sortField}, published.${options.sortField} )"
            }
            queryStr += " WHERE ($whereString)"
            countQueryStr += " WHERE ($whereString)"
        }

        // add sort order
        if (!options.sortField.isNullOrEmpty()) {
            queryStr += " ORDER BY \$temp ${options.sortOrder}"
        }

        // add limit
        if (options.size != null) {
            queryStr += " LIMIT ${options.size}"
        }

        // execute a native query
        log.debug("Query-String: $queryStr")
        val typedQuery = entityManager.createNativeQuery(queryStr, typeImpl.jpaType.java)
        val typedCountQuery = entityManager.createNativeQuery(countQueryStr)
        if (!criteria.isNullOrEmpty()) {
            for ((i, value) in criteria.values.iterator().withIndex()) {
                if (value != null) {
                    typedQuery.setParameter("c$i", value)
                    typedCountQuery.setParameter("c$i", value)
                }
            }
        }
        @Suppress("UNCHECKED_CAST")
        val docs = typedQuery.resultList as List<EntityBase>
        val numDocs = typedCountQuery.singleResult as BigInteger

        if (options.resolveReferences) {
            // TODO what is expected here?
        }
        return FindAllResults(numDocs.toLong(), docs.map { mapEntityToJson(it) })
    }

    override fun <T : EntityType> countChildrenOfType(id: String, type: KClass<T>): Map<String, Long> {
        TODO("Not yet implemented")
    }

    override fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String?): JsonNode {
        val typeImpl = getEntityTypeImpl(type)
        val existingEntity = if (id != null) entityManager.find(typeImpl.jpaType.java, id.toInt()) else null

        val persistedEntity = (if (existingEntity == null) {
            val entity = mapper.readValue(data, typeImpl.jpaType.java)
            entity.id = null // prevent 'detached entity passed to persist' errors if the id is set already
            (entity as? EntityWithCatalog)?.catalog = currentCatalog()
            entityManager.persist(entity)
            entity
        } else {
            // merge json from existing entity with incoming data
            val existingData = mapper.readTree(mapper.writeValueAsString(existingEntity))
            val mergedData = mapper.writeValueAsString(mapper.readerForUpdating(existingData).readValue(data))
            val entity = mapper.readValue(mergedData, typeImpl.jpaType.java)
            (entity as? EntityWithCatalog)?.catalog = currentCatalog()
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

    override val catalogs: Array<String>
        get() {
            return findAll(CatalogInfoType::class).map { it["id"].textValue() }.toTypedArray()
        }

    override val currentCatalog: String?
        get() {
            return currentCatalog()?.identifier
        }

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

    override fun acquireCatalog(name: String): Closeable {
        // find the catalog by name
        val typeImpl = getEntityTypeImpl(CatalogInfoType::class)
        val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e WHERE e.identifier = :name"
        val catalog = entityManager.createQuery(queryStr, typeImpl.jpaType.java).
                setParameter("name", name).singleResult
        catalogId.set(catalog.id)

        // start a transaction that will be committed when closed
        return ClosableTransaction(transactionManager) { catalogId.set(null) }
    }

    override fun acquireDatabase(name: String): Closeable {
        // NOTE name parameter is ignored, since we use one database only
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

    private fun currentCatalog(): de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog? {
        val catId = catalogId.get()
        return if (catId != null)
            entityManager.getReference(de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog::class.java, catId)
        else null
    }

    private fun processCriteria(type: KClass<out EntityBase>, query: List<QueryField>, options: FindOptions?): Map<String, Any?> {
        val result: HashMap<String, Any?> = LinkedHashMap()
        for ((i, criteria) in query.iterator().withIndex()) {
            val field = criteria.field
            val value = criteria.value
            val invert = criteria.invert

            // resolve the field to the column
            val declaredPropertyList = type.memberProperties.filter { p -> p.name == field }
            val fieldQueryName = when {
                // check if the field is directly declared in the entity
                declaredPropertyList.isNotEmpty() -> {
                    getColumnName(type, field)
                }
                // if the field is not declared in the entity it could be a property of the embedded data
                EntityWithEmbeddedData::class.java.isAssignableFrom(type.java) -> {
                    // NOTE we allow embedded data properties to be queried in one of the following ways:
                    // * unwrapped property: e.g. { "firstName": "Petra" }
                    // * property inside embedded data property: e.g. { "data.firstName": "Petra" }
                    // * property inside embedded data column: e.g. { "message.action": "update" }
                    val dataColumn = getColumnName(type, "data")
                    val propertyWithoutRoot = if (field.startsWith("$dataColumn.")) field.removePrefix("$dataColumn.")
                        else field.removePrefix("data.")
                    val propertyPath = propertyWithoutRoot.split('.')
                    var queryPath = dataColumn
                    for ((j, part) in propertyPath.iterator().withIndex()) {
                        queryPath += (if (j == propertyPath.size-1) "->>" else "->") + "'${part}'"
                    }
                    queryPath
                }
                else -> {
                    throw PersistenceException.withReason("Unknown field '$field' in query.")
                }
            }

            // make criteria
            if (value == null) {
                result["$fieldQueryName IS " + (if (invert) "NOT " else "") + "NULL"] = null
            }
            else if (!criteria.operator.isNullOrEmpty()) {
                result["$fieldQueryName${criteria.operator} :c$i"] = value
            }
            else {
                val operator = when (options?.queryType) {
                    QueryType.LIKE -> {
                        if (invert) "NOT LIKE" else "LIKE"
                    }
                    QueryType.EXACT -> {
                        if (invert) " !=" else " ="
                    }
                    QueryType.CONTAINS -> {
                        if (invert) " NOT IN" else " IN"
                    }
                    else -> "="
                }
                result["$fieldQueryName$operator :c$i"] =
                        if (options?.queryType == QueryType.LIKE) "%${value.toLowerCase()}%" else value
            }
        }
        return result
    }

    /**
     * Get the table name for an entity class
     */
    private fun getTableName(type: KClass<out EntityBase>): String {
        return getMetaData(type).tableName
    }

    /**
     * Get the table name for a property of an entity class
     */
    private fun getColumnName(type: KClass<out EntityBase>, propertyName: String): String {
        return getMetaData(type).getPropertyColumnNames(propertyName)[0]
    }

    /**
     * Get the persistence mapping meta data for an entity class
     */
    private fun getMetaData(type: KClass<out EntityBase>): AbstractEntityPersister {
        val metamodel = entityManager.entityManagerFactory.metamodel
        return (metamodel as MetamodelImplementor).entityPersister(type.java.name) as AbstractEntityPersister
    }
}