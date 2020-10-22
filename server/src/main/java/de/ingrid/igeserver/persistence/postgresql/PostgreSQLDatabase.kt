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
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.ModelRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataSerializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataTypeRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithRecordId
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.services.FIELD_VERSION
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import java.io.Closeable
import java.math.BigInteger
import javax.persistence.EntityManager
import kotlin.reflect.KClass
import kotlin.reflect.full.isSubclassOf

@Service
class PostgreSQLDatabase : DBApi {

    companion object {
        private const val DB_ID = "db_id"
        private const val DB_VERSION = "db_version"
        private const val SORT_FIELD_ALIAS = "query_sort_field"

        private val PARAMETER_REGEX = Regex(":([^\\s)]+)")
        private val COUNT_QUERY_REGEX = Regex("SELECT .*? FROM")

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

    @Autowired
    private lateinit var modelRegistry: ModelRegistry

    /**
     * Id of the catalog that is acquired on the current thread
     */
    private val catalogId = ThreadLocal<Int?>()

    /**
     * Jackson mapper used for deserialization of incoming JSON strings
     */
    private val mapper: ObjectMapper by lazy {
        val mapper = jacksonObjectMapper()
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
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

        // the record id can only be determined if type has a record id
        return if (typeImpl.jpaType.isSubclassOf(EntityWithRecordId::class)) {
            val entities = getEntitiesByIdentifier(type, docId)
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

    override fun countChildren(docId: String): Long {
        val typeImpl = getEntityTypeImpl(DocumentWrapperType::class)
        val queryStr = "SELECT count(e) FROM ${typeImpl.jpaType.simpleName} e WHERE e.parent.uuid = :docId"
        return entityManager.createQuery(queryStr).setParameter("docId", docId).singleResult as Long
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
        return findAllExt(type, listOf(Pair(query, options)), options)
    }

    override fun <T : EntityType> findAllExt(type: KClass<T>, queries: List<Pair<List<QueryField>?, QueryOptions>>, options: FindOptions): FindAllResults {
        val typeImpl = getEntityTypeImpl(type)
        val typeInfo = modelRegistry.getTypeInfo(typeImpl.jpaType)
                ?: throw PersistenceException.withReason("Type '$type' is not mapped to the database.")

        // NOTE we need to use a native query to use jsonb operators

        // process query criteria
        val criteria = mutableMapOf<String, Any?>()
        val conditions = mutableListOf<String>()
        val joins = mutableListOf<JoinInfo>()
        if (!queries.isNullOrEmpty()) {
            queries.forEachIndexed { i, query ->
                val queryFields = query.first
                if (!queryFields.isNullOrEmpty()) {
                    val queryOptions = query.second
                    val processedCriteria = processCriteria(typeImpl.jpaType, queryFields, queryOptions, i+1)
                    processedCriteria.first.forEach {
                        criteria[it.key] = it.value
                    }
                    conditions.add(" (" + processedCriteria.first.keys.joinToString(separator = " ${queryOptions.queryOperator} ") { it } + ") ")
                    joins.addAll(processedCriteria.second)
                }
            }
        }

        // resolve sort value
        val sortColumn = if (!options.sortField.isNullOrEmpty()) {
            // check if the sort field exists in the searched entity type
            val fieldInfo = modelRegistry.getFieldInfo(typeInfo, options.sortField)
            if (fieldInfo != null) {
                "${fieldInfo.columnName} as $SORT_FIELD_ALIAS"
            }
            // if the sort field does not exist in the searched entity type, we search in related entities
            else {
                val relatedTypes = typeInfo.relatedTypes
                val candidates = relatedTypes.filter { (type) ->
                    modelRegistry.getFieldInfo(modelRegistry.getTypeInfo(type)!!, options.sortField, true) != null
                }
                if (candidates.size == 1) {
                    val candidate = candidates.entries.first()
                    val relatedTypeInfo = modelRegistry.getTypeInfo(candidate.key)!!
                    val sortFieldInfo = modelRegistry.getFieldInfo(relatedTypeInfo, options.sortField, true)!!
                    val relationFieldInfos = candidate.value
                    val sortColumns = mutableSetOf<String>()
                    relationFieldInfos.filter { it.fkName != null }.forEachIndexed { i, relationFieldInfo ->
                        // add join if not existing yet
                        val joinInfos = joins.filter { j -> j.relationColumn == relationFieldInfo.columnName }
                        val joinInfo = if (joinInfos.isEmpty()) {
                            val joinInfo = JoinInfo(typeInfo, relatedTypeInfo, relationFieldInfo, 1, i+1)
                            joins.add(joinInfo)
                            joinInfo
                        }
                        else {
                            joinInfos[0]
                        }
                        sortColumns.add(joinInfo.joinedTableAlias+"."+sortFieldInfo.columnName)
                    }

                    "GREATEST(${sortColumns.joinToString(", ")}) as $SORT_FIELD_ALIAS"
                }
                else {
                    throw PersistenceException.withReason("Cannot resolve sort field '${options.sortField}'.")
                }
            }
        }
        else ""

        val join = joins.joinToString(separator = " ") { it.joinString }
        val where = conditions.joinToString(separator = " ${options.queryOperator} ") { it }

        var queryStr = "SELECT * FROM ${typeInfo.tableName} ${typeInfo.aliasName()} $join " +
                if (where.isNotBlank()) "WHERE $where" else ""
        val countQueryStr = COUNT_QUERY_REGEX.replace(queryStr, "SELECT count(*) as count FROM")

        // add sort order
        if (!options.sortField.isNullOrEmpty()) {
            queryStr = queryStr.replace("SELECT * ", "SELECT *, $sortColumn ")
            queryStr += " ORDER BY $SORT_FIELD_ALIAS ${options.sortOrder}"
        }

        // add limit
        if (options.size != null) {
            queryStr += " LIMIT ${options.size}"
        }

        // execute a native query
        log.debug("Query-String: $queryStr")
        val typedQuery = entityManager.createNativeQuery(queryStr, typeImpl.jpaType.java)
        val typedCountQuery = entityManager.createNativeQuery(countQueryStr)
        if (criteria.isNotEmpty()) {
            criteria.forEach { (condition, value) ->
                if (value != null) {
                    val parameterName = PARAMETER_REGEX.find(condition)?.groups?.get(1)?.value
                    if (parameterName != null) {
                        typedQuery.setParameter(parameterName, value)
                        typedCountQuery.setParameter(parameterName, value)
                    }
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

    override fun <T : EntityType> remove(type: KClass<T>, docId: String): Boolean {
        val entities = getEntitiesByIdentifier(type, docId)
        val count = entities.size
        if (count == 0) {
            throw PersistenceException.withReason("Failed to delete non-existing document of type '${type.simpleName}' with id '$docId'.")
        }
        entities.forEach { entityManager.remove(it) }
        log.debug("Deleted $count records of type '$type' with id '$docId'.")
        return true
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

    private fun <T : EntityType> getEntitiesByIdentifier(type: KClass<T>, docId: String) : List<EntityBase> {
        val typeImpl = getEntityTypeImpl(type)
        if (typeImpl.idAttribute == null) {
            throw PersistenceException.withReason("Entity type '$type' does not define an id attribute.")
        }
        val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e WHERE e.${typeImpl.idAttribute} = :docId"
        return entityManager.createQuery(queryStr, typeImpl.jpaType.java).setParameter("docId", docId).resultList
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

    private class JoinInfo(
            val thisType: ModelRegistry.TypeInfo,
            val otherType: ModelRegistry.TypeInfo,
            val relationField: ModelRegistry.FieldInfo,
            val thisAliasIndex: Int = 1,
            val otherAliasIndex: Int = 1
    ) {
        val relationColumn: String?
            get() = relationField.fkName

        val joinedTableAlias: String
            get() = otherType.aliasName(otherAliasIndex)

        val joinString: String
            get() = "JOIN ${otherType.tableName} ${otherType.aliasName(otherAliasIndex)} ON " +
                    "${thisType.aliasName(thisAliasIndex)}.${relationField.fkName} = " +
                    "${otherType.aliasName(otherAliasIndex)}.${otherType.pkName}"
    }

    /**
     * Extract value and join conditions for the given query
     * The result is a pair with the following content
     * - first: Map of condition strings for WHERE clause and their parameters
     * - second: List of JoinInfo instances that are necessary to select the query fields
     * The index parameter might be used to generate table aliases for joins
     */
    private fun processCriteria(type: KClass<out EntityBase>, query: List<QueryField>, options: QueryOptions, index: Int): Pair<Map<String, Any?>, Set<JoinInfo>> {
        val where: HashMap<String, Any?> = LinkedHashMap()
        val joins = mutableSetOf<JoinInfo>()

        val typeInfo = modelRegistry.getTypeInfo(type)
        if (typeInfo != null) {
            query.forEachIndexed { i, criteria ->
                // resolve field
                val fieldData = resolveField(typeInfo, criteria.field, index)
                val queryFieldName = fieldData.first
                joins.addAll(fieldData.second)

                // make criteria
                val value = criteria.value
                val invert = criteria.invert
                val parameterName = "p${index}_$i"
                if (value == null) {
                    where["$queryFieldName IS " + (if (invert) "NOT " else "") + "NULL"] = null
                }
                else if (!criteria.operator.isNullOrEmpty()) {
                    where["$queryFieldName${criteria.operator} :$parameterName"] = value
                }
                else {
                    val operator = when (options.queryType) {
                        QueryType.LIKE -> {
                            if (invert) " NOT ILIKE" else " ILIKE"
                        }
                        QueryType.EXACT -> {
                            if (invert) " !=" else " ="
                        }
                        QueryType.CONTAINS -> {
                            if (invert) " NOT IN" else " IN"
                        }
                    }
                    where["$queryFieldName$operator :$parameterName"] =
                            if (options.queryType == QueryType.LIKE) "%${value.toLowerCase()}%" else value
                }
            }
        }
        return Pair(where, joins)
    }

    private fun resolveField(typeInfo: ModelRegistry.TypeInfo, field: String, index: Int): Pair<String, Set<JoinInfo>> {
        val joins = mutableSetOf<JoinInfo>()

        // field might contain dots to define a path
        val fieldPath = field.split(delimiters = arrayOf("."), limit = 2).let {
            Pair(it[0], it.getOrNull(1) ?: "")
        }
        val fieldInfo = modelRegistry.getFieldInfo(typeInfo, fieldPath.first, true)

        // resolve the field to the column
        val queryFieldName = when {
            // simple field or relation field with no path to related entity attribute
            fieldInfo != null && fieldPath.second.isBlank() -> {
                "${typeInfo.aliasName()}.${fieldInfo.columnName}"
            }
            // relation field
            fieldInfo != null && fieldInfo.isRelation && fieldInfo.relatedEntityType != null -> {
                // TODO resolve recursive, if paths with length > 2 should be handled
                val otherFieldName = fieldPath.second
                val otherTypeInfo = modelRegistry.getTypeInfo(fieldInfo.relatedEntityType)!!
                val otherFieldInfo = modelRegistry.getFieldInfo(otherTypeInfo, otherFieldName, true)
                        ?: throw PersistenceException.withReason("Unable to resolve field '$otherFieldName' in entity type '${otherTypeInfo.type}'.")
                if (fieldInfo.fkName == null) {
                    throw PersistenceException.withReason("Field '${fieldInfo.name}' in entity type '${typeInfo.type}' defines a " +
                            "(one|many)-to-many relation that can't be queried.")
                }
                joins.add(JoinInfo(typeInfo, otherTypeInfo, fieldInfo, 1, index))
                "${otherTypeInfo.aliasName(index)}.${otherFieldInfo.columnName}"
            }
            // if the field is not declared in the entity it could be a property of the embedded data
            EntityWithEmbeddedData::class.java.isAssignableFrom(typeInfo.type.java) -> {
                // NOTE we allow embedded data properties to be queried in one of the following ways:
                // * unwrapped property: e.g. { "firstName": "Petra" }
                // * property inside embedded data property: e.g. { "data.firstName": "Petra" }
                // * property inside embedded data column: e.g. { "message.action": "update" }
                val dataField = modelRegistry.getFieldInfo(typeInfo, "data")
                        ?: throw PersistenceException.withReason("No 'data' field defined in entity type '{$typeInfo.type}'.")
                val dataColumn = dataField.columnName
                val propertyWithoutRoot = if (field.startsWith("$dataColumn.")) field.removePrefix("$dataColumn.")
                    else field.removePrefix("data.")
                val propertyPath = propertyWithoutRoot.split('.')

                var queryPath = "${typeInfo.aliasName()}.${dataColumn}"
                propertyPath.forEachIndexed { j, part ->
                    queryPath += (if (j == propertyPath.size-1) "->>" else "->") + "'${part}'"
                }
                queryPath
            }
            else -> {
                throw PersistenceException.withReason("Unknown field '$field' in query (entity type '{$typeInfo.type}').")
            }
        }
        return Pair(queryFieldName, joins)
    }
}