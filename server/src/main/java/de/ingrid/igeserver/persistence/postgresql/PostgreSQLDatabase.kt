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
import de.ingrid.igeserver.persistence.postgresql.jpa.JoinInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.ModelRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataTypeRegistry
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EntitySerializer
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
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog as CatalogEntity

@Service
class PostgreSQLDatabase : DBApi {

    companion object {
        private const val DB_ID = "db_id"
        private const val DB_VERSION = "db_version"
        private const val SORT_FIELD_ALIAS = "query_sort_field"

        private val PARAMETER_REGEX = Regex(":([^\\s)\\]]+)")
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
     * Last query string on the current thread
     */
    private val lastQuery = ThreadLocal<String?>()

    /**
     * Jackson mapper used for mapping entities to JSON with references replaced by identifiers
     */
    private val mapper: ObjectMapper by lazy {
        getMapper(false)
    }

    /**
     * Jackson mapper used for mapping entities to JSON with resolved references
     */
    private val resolvingMapper: ObjectMapper by lazy {
        getMapper(true)
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
            when {
                entities.size == 1 -> (entities[0] as EntityWithRecordId).id?.toString()
                entities.size > 1 -> throw PersistenceException.withMultipleEntities(docId, type.simpleName, currentCatalog)
                else -> null
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
        if (doc is ObjectNode) {
            val version = if (doc.hasNonNull(DB_VERSION)) doc[DB_VERSION].intValue() else null
            if (version != null) {
                doc.put(FIELD_VERSION, version.toString())
            }

            INTERNAL_FIELDS.forEach {
                doc.remove(it)
            }

            // recurse into sub-nodes
            doc.elements().forEach {
                if (it is ObjectNode) {
                    removeInternalFields(it)
                }
            }
        }
    }

    override fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode? {
        val typeImpl = getEntityTypeImpl(type)
        val result = entityManager.find(typeImpl.jpaType.java, id?.toInt())
        return if (result !== null) mapEntityToJson(result, false) else null
    }

    override fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode> {
        val typeImpl = getEntityTypeImpl(type)

        val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e"
        return entityManager.createQuery(queryStr, typeImpl.jpaType.java).resultList.map { mapEntityToJson(it, false) }
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
        val conditions = mutableSetOf<String>()
        val joins = mutableSetOf<JoinInfo>()
        if (!queries.isNullOrEmpty()) {
            queries.forEachIndexed { i, query ->
                val queryFields = query.first
                if (!queryFields.isNullOrEmpty()) {
                    val queryOptions = query.second
                    val queryJoins = mutableSetOf<JoinInfo>()
                    val processedCriteria = processCriteria(typeImpl.jpaType, queryFields, queryOptions, i+1, queryJoins)
                    processedCriteria.forEach {
                        criteria[it.key] = it.value
                    }
                    joins.addAll(queryJoins)
                    conditions.add(" (" + processedCriteria.keys.joinToString(separator = " ${queryOptions.queryOperator} ") { it } + ") ")
                }
            }
        }

        // resolve sort value
        val sortColumn = if (!options.sortField.isNullOrEmpty()) resolveSortField(typeInfo, options.sortField, joins) else ""

        // create query string
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
        lastQuery.set(queryStr)
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

        return FindAllResults(numDocs.toLong(), docs.map { mapEntityToJson(it, options.resolveReferences) })
    }

    override fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String?): JsonNode {
        val typeImpl = getEntityTypeImpl(type)
        val existingEntity = if (id != null) entityManager.find(typeImpl.jpaType.java, id.toInt()) else null

        val persistedEntity = (if (existingEntity == null) {
            val entity = mapper.readValue(data, typeImpl.jpaType.java)
            entity.id = null // prevent 'detached entity passed to persist' errors if the id is set already
            prepareForSave(entity)
            entityManager.persist(entity)
            entity
        } else {
            // merge json from existing entity with incoming data
            val existingData = mapper.readTree(mapper.writeValueAsString(existingEntity))
            val mergedData = mapper.writeValueAsString(mergeJson(existingData, mapper.readTree(data)))
            val entity = mapper.readValue(mergedData, typeImpl.jpaType.java)
            prepareForSave(entity)
            entityManager.merge(entity)
        }) as EntityBase

        // synchronize with database (e.g. update version attribute if existing)
        entityManager.flush()
        return mapEntityToJson(persistedEntity, true)
    }

    override fun <T : EntityType> remove(type: KClass<T>, docId: String): Boolean {
        val entities = getEntitiesByIdentifier(type, docId)
        val count = entities.size
        if (count == 0) {
            throw PersistenceException.withReason("Failed to delete non-existing document of type '${type.simpleName}' with id '$docId'.")
        }
        entities.forEach {
            it.beforeRemove(entityManager)
            entityManager.remove(it)
        }
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
        val id = settings.name.toLowerCase().replace(" ".toRegex(), "_")
        if (!catalogExists(id)) {
            settings.id = acquireDatabase("").use {
                val catalog = CatalogEntity().apply {
                    identifier = id
                    name = settings.name
                    description = settings.description
                    type = settings.type
                }
                entityManager.persist(catalog)
                id
            }
        }
        return settings.id
    }

    override fun updateCatalog(settings: Catalog) {
        if (settings.id == null || !catalogExists(settings.id!!)) {
            throw PersistenceException.withReason("Catalog '${settings.id}' does not exist.")
        }
        acquireDatabase("").use {
            val catalog = getCatalog(settings.id!!)!!
            catalog.name = settings.name
            catalog.description = settings.description
            entityManager.merge(catalog)
        }
    }

    override fun removeCatalog(name: String): Boolean {
        return if (catalogExists(name)) {
            acquireDatabase("").use {
                val catalog = getCatalog(name)!!
                entityManager.remove(catalog)
            }
            true
        }
        else {
            throw PersistenceException.withReason("Failed to delete non-existing catalog with name '$name'.")
        }
    }

    override fun catalogExists(name: String): Boolean {
        return getCatalog(name) != null
    }
    
    override fun execSQL(sql: String) {
        entityManager.createNativeQuery(sql).executeUpdate()
    }

    override fun acquireCatalog(name: String): Closeable {
        val catalog = getCatalog(name)
        return if (catalog != null) {
            catalogId.set(catalog.id)

            // start a transaction that will be committed when closed
            ClosableTransaction(transactionManager) { catalogId.set(null) }
        }
        else {
            throw PersistenceException.withReason("Catalog '$name' does not exist.")
        }
    }

    override fun acquireDatabase(name: String): Closeable {
        // NOTE name parameter is ignored, since we use one database only
        // start a transaction that will be committed when closed
        return ClosableTransaction(transactionManager)
    }

    override fun beginTransaction() {
        entityManager.transaction.begin()
    }

    override fun commitTransaction() {
        entityManager.transaction.commit()
    }

    override fun rollbackTransaction() {
        entityManager.transaction.rollback()
    }

    fun getLastQuery(): String? {
        return lastQuery.get()
    }

    /**
     * Private interface
     */

    private fun <T : EntityType> getEntityTypeImpl(type: KClass<T>): PostgreSQLEntityType {
        return entityTypeMap[type] ?: throw PersistenceException.withReason("No entity type '$type' registered.")
    }

    private fun getCatalog(name: String): CatalogEntity? {
        // find the catalog by name
        val typeImpl = getEntityTypeImpl(CatalogInfoType::class)
        val catalogs = getEntitiesByIdentifier(CatalogInfoType::class, name)
        return when {
            catalogs.size == 1 -> catalogs[0] as CatalogEntity
            catalogs.size > 1 -> throw PersistenceException.withMultipleEntities(name, typeImpl.entityType.simpleName, null)
            else -> null
        }
    }

    private fun currentCatalog(): CatalogEntity? {
        val catId = catalogId.get()
        return if (catId != null)
            entityManager.getReference(CatalogEntity::class.java, catId)
        else null
    }

    private fun <T : EntityType> getEntitiesByIdentifier(type: KClass<T>, docId: String) : List<EntityBase> {
        val typeImpl = getEntityTypeImpl(type)
        if (typeImpl.idAttribute == null) {
            throw PersistenceException.withReason("Entity type '$type' does not define an id attribute.")
        }
        val queryStr = "SELECT e FROM ${typeImpl.jpaType.simpleName} e WHERE e.${typeImpl.idAttribute} = :docId"
        return entityManager.createQuery(queryStr, typeImpl.jpaType.java).setParameter("docId", docId).resultList
    }

    private fun prepareForSave(entity: EntityBase) {
        (entity as? EntityWithCatalog)?.catalog = currentCatalog()
        entity.beforePersist(entityManager)
    }

    private fun mapEntityToJson(entity: EntityBase, resolveReferences: Boolean): JsonNode {
        // NOTE this is not as optimized as mapper.valueToTree(obj), but allows to use serialization annotations
        val serializer = if (resolveReferences) resolvingMapper else mapper
        return mapper.readTree(serializer.writeValueAsString(entity))
    }

    private fun mergeJson(mainNode: JsonNode, updateNode: JsonNode): JsonNode {
        val fieldNames = updateNode.fieldNames()
        fieldNames.forEachRemaining {fieldName ->
            val jsonNode = mainNode[fieldName]
            // if field exists and is an embedded object
            if (jsonNode != null && jsonNode.isObject) {
                mergeJson(jsonNode, updateNode[fieldName])
            }
            else if (mainNode is ObjectNode) {
                // overwrite field
                val value = updateNode[fieldName]
                mainNode.replace(fieldName, value)
            }
        }
        return mainNode
    }

    private fun getMapper(resolveReferences: Boolean): ObjectMapper {
        val mapper = jacksonObjectMapper()
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        mapper.findAndRegisterModules()

        val module = SimpleModule()
        // register custom deserializer for embedded data
        module.setDeserializerModifier(object : BeanDeserializerModifier() {
            override fun modifyDeserializer(config: DeserializationConfig,
                                            beanDesc: BeanDescription,
                                            deserializer: JsonDeserializer<*>): JsonDeserializer<*> {
                return when {
                    EntityWithEmbeddedData::class.java.isAssignableFrom(beanDesc.beanClass) ->
                        EmbeddedDataDeserializer(deserializer, embeddedDataTypes)
                    else -> deserializer
                }
            }
        })
        // register custom serializer for entities
        module.setSerializerModifier(object : BeanSerializerModifier() {
            override fun modifySerializer(config: SerializationConfig,
                                          beanDesc: BeanDescription,
                                          serializer: JsonSerializer<*>): JsonSerializer<*> {
                return when {
                    EntityBase::class.java.isAssignableFrom(beanDesc.beanClass) ->
                        EntitySerializer(serializer, mapper, resolveReferences)
                    else -> serializer
                }
            }
        })
        mapper.registerModule(module)
        return mapper
    }

    /**
     * Extract value and join conditions and necessary joins for the given query
     * The result is a map of condition strings for the WHERE clause and their parameters
     * The index parameter might be used to generate table aliases for joins
     */
    private fun processCriteria(type: KClass<out EntityBase>, query: List<QueryField>, options: QueryOptions, index: Int, joins: MutableSet<JoinInfo>): Map<String, Any?> {
        val where: HashMap<String, Any?> = LinkedHashMap()

        val typeInfo = modelRegistry.getTypeInfo(type)
        if (typeInfo != null) {
            val typeInstance = type.java.getConstructor().newInstance()
            query.forEachIndexed { i, criteria ->
                // resolve field
                val queryFieldName = resolveField(typeInfo, criteria.field, index, joins)

                // make criteria
                val value = typeInstance.mapQueryValue(criteria.field, criteria.value, entityManager)
                val invert = criteria.invert
                val parameterName = "p${index}_$i"
                if (value == null) {
                    where["$queryFieldName IS " + (if (invert) "NOT " else "") + "NULL"] = null
                }
                else if (!criteria.operator.isNullOrEmpty()) {
                    where["$queryFieldName${criteria.operator} :$parameterName"] = value
                }
                else {
                    val condition = when (options.queryType) {
                        QueryType.LIKE -> {
                            (if (invert) " NOT ILIKE " else " ILIKE ") + ":$parameterName"
                        }
                        QueryType.EXACT -> {
                            (if (invert) " != " else " = ") + ":$parameterName"
                        }
                        QueryType.CONTAINS -> {
                            (if (invert) " != " else " = ") + "ANY(ARRAY[:$parameterName])"
                        }
                    }
                    where["$queryFieldName$condition"] =
                            if (options.queryType == QueryType.LIKE) "%${value.toString().toLowerCase()}%" else value
                }
            }
        }
        return where
    }

    /**
     * Get the query field term and necessary joins for the given field starting from the given type
     */
    private fun resolveField(typeInfo: ModelRegistry.TypeInfo, field: String, index: Int, joins: MutableSet<JoinInfo>,
                             lastTypeInfo: ModelRegistry.TypeInfo? = null, depth: Int = 0): String {
        // field might contain dots to define a path
        val fieldPath = field.split(delimiters = arrayOf("."), limit = 2).let {
            Pair(it[0], it.getOrNull(1) ?: "")
        }
        val fieldInfo = modelRegistry.getFieldInfo(typeInfo, fieldPath.first, true)

        // alias index is always 1 if we resolve a root field
        val thisAliasIndex = if (depth == 0) 1 else index

        // resolve the field to the column
        return when {
            // relation field
            fieldInfo != null && fieldInfo.isRelation && fieldInfo.relatedEntityType != null &&
                    (fieldInfo.nmRelatedProperty != null || (!fieldPath.second.isBlank() && fieldInfo.fkName != null)) &&
                    // prevent recursion in many to many relations
                    modelRegistry.getTypeInfo(fieldInfo.relatedEntityType) != lastTypeInfo -> {
                val relation: Triple<ModelRegistry.TypeInfo, String, ModelRegistry.FieldInfo> = when {
                    fieldInfo.nmRelatedProperty != null -> {
                        // many-to-many relation end
                        val otherTypeInfo = modelRegistry.getTypeInfo(fieldInfo.relatedEntityType)!!
                        val otherFieldName = fieldInfo.nmRelatedProperty
                        val otherFieldInfo = modelRegistry.getFieldInfo(otherTypeInfo, otherFieldName)!!
                        Triple(otherTypeInfo, otherFieldName, otherFieldInfo)
                    }
                    fieldInfo.fkName != null -> {
                        // many-to-one relation end
                        val otherTypeInfo = modelRegistry.getTypeInfo(fieldInfo.relatedEntityType)!!
                        val otherFieldName = fieldPath.second
                        Triple(otherTypeInfo, otherFieldName, fieldInfo)
                    }
                    else -> {
                        // one-to-many relation end
                        throw PersistenceException.withReason("Relation field '${fieldInfo.name}' in entity type '${typeInfo.type}' defines a " +
                                "one-to-many relation that cannot be joined for querying.")
                    }
                }
                // add relation table and joins, if not existing yet
                val otherTypeInfo = relation.first
                val otherFieldName = relation.second
                val otherFieldInfo = relation.third
                val existingJoins = joins.filter { j -> j.relationField == otherFieldInfo }
                val join = if (existingJoins.isNotEmpty()) existingJoins.first() else {
                    val newJoin = JoinInfo(typeInfo, otherTypeInfo, otherFieldInfo, thisAliasIndex, index)
                    joins.add(newJoin)
                    newJoin
                }
                resolveField(otherTypeInfo, otherFieldName, join.otherAliasIndex, joins, typeInfo, depth+1)
            }
            // simple field or relation field with no path to related entity attribute
            fieldInfo != null && fieldPath.second.isBlank() -> {
                "${typeInfo.aliasName(thisAliasIndex)}.${fieldInfo.columnName}"
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

                var queryPath = "${typeInfo.aliasName(thisAliasIndex)}.${dataColumn}"
                propertyPath.forEachIndexed { j, part ->
                    queryPath += (if (j == propertyPath.size-1) "->>" else "->") + "'${part}'"
                }
                queryPath
            }
            else -> {
                throw PersistenceException.withReason("Unknown field '$field' in query (entity type '{$typeInfo.type}').")
            }
        }
    }

    /**
     * Get the sort column and necessary joins for the given field starting from the given type
     */
    private fun resolveSortField(typeInfo: ModelRegistry.TypeInfo, sortField: String?, joins: MutableSet<JoinInfo>): String {
        return if (!sortField.isNullOrEmpty()) {
            // check if the sort field exists in the searched entity type
            val fieldInfo = modelRegistry.getFieldInfo(typeInfo, sortField)
            if (fieldInfo != null) {
                "${typeInfo.aliasName()}.${fieldInfo.columnName} as $SORT_FIELD_ALIAS"
            }
            // if the sort field does not exist in the searched entity type, we search in related entities
            else {
                val relatedTypes = typeInfo.relatedTypes
                val candidates = relatedTypes.filter { (type) ->
                    modelRegistry.getFieldInfo(modelRegistry.getTypeInfo(type)!!, sortField, true) != null
                }
                if (candidates.size == 1) {
                    val candidate = candidates.entries.first()
                    val relatedTypeInfo = modelRegistry.getTypeInfo(candidate.key)!!
                    val sortFieldInfo = modelRegistry.getFieldInfo(relatedTypeInfo, sortField, true)!!
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
                        sortColumns.add("${joinInfo.joinedTableAlias}.${sortFieldInfo.columnName}")
                    }
                    "GREATEST(${sortColumns.joinToString(", ")}) as $SORT_FIELD_ALIAS"
                }
                else {
                    throw PersistenceException.withReason("Cannot resolve sort field '${sortField}'.")
                }
            }
        }
        else ""
    }
}
