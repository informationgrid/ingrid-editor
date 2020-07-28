package de.ingrid.igeserver.persistence.orientdb

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import com.orientechnologies.orient.core.exception.OConcurrentModificationException
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass
import com.orientechnologies.orient.core.record.OElement
import com.orientechnologies.orient.core.record.ORecordAbstract
import com.orientechnologies.orient.core.record.impl.ODocument
import com.orientechnologies.orient.core.sql.executor.OResult
import com.orientechnologies.orient.core.sql.executor.OResultSet
import com.orientechnologies.orient.server.OServer
import com.orientechnologies.orient.server.OServerMain
import com.orientechnologies.orient.server.plugin.OServerPluginManager
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.orientdb.model.meta.OCatalogInfoType
import de.ingrid.igeserver.persistence.orientdb.model.meta.OBehaviourType
import de.ingrid.igeserver.persistence.orientdb.model.meta.OUserInfoType
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.services.FIELD_PARENT
import de.ingrid.igeserver.services.MapperService.Companion.getJsonNode
import de.ingrid.igeserver.services.MapperService.Companion.removeDBManagementFields
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.io.Closeable
import java.io.File
import java.util.*
import java.util.stream.Collectors
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy
import kotlin.reflect.KClass

@Service
class OrientDBDatabase : DBApi {

    companion object {
        private const val DB_ID = "@rid"
    }

    @Autowired
    lateinit var entityTypes: List<OrientDBEntityType>

    @Autowired
    lateinit var documentTypes: List<OrientDBDocumentEntityType>

    // mapping between entity types and implementing classes
    private lateinit var entityTypeMap: Map<KClass<out EntityType>, OrientDBEntityType>

    // embedded server instance
    private lateinit var serverInternal: OServer

    // database management environment (backing field for orientDB property)
    private lateinit var orientDBInternal: OrientDB

    // setter for the database management environment, if the embedded server should not be used
    var orientDB: OrientDB
        set(value) {
            orientDBInternal = value
        }
        get() {
            if (!::orientDBInternal.isInitialized) {
                throw PersistenceException("Database environment is not initialized")
            }
            return orientDBInternal
        }

    // database type for creating databases (filesystem)
    private val dbType = ODatabaseType.PLOCAL

    // orientDB uses these credentials when creating databases
    private var serverUser: String = "admin"
    private var serverPassword: String = "admin"

    private val log = logger()

    /**
     * Database server handling
     */

    /**
     * Start the embedded server and setup the database management environment
     */
    fun startServer(dbConfigFile: String) {
        if (!::serverInternal.isInitialized) {
            log.info("Starting embedded OrientDB server")

            // setup server
            val orientDbHome = File("").absolutePath
            System.setProperty("ORIENTDB_HOME", orientDbHome)
            serverInternal = OServerMain.create(true)
            serverInternal.startup(javaClass.getResourceAsStream(dbConfigFile))
            val manager = OServerPluginManager()
            manager.config(serverInternal)
            serverInternal.activate()
            manager.startup()

            // setup management environment
            // NOTE we could also create and access databases directly using the server instance,
            // but setting up OrientDB instance allows us to use advanced features like connection
            // pooling and makes this class better testable since it could also use an injected environment
            orientDBInternal = serverInternal.context

            setup()
        }
    }

    @PostConstruct
    fun startServer() {
        startServer("/db.config.xml")
    }

    @PreDestroy
    fun destroy() {
        if (::serverInternal.isInitialized) {
            log.info("Shutdown OrientDB server")
            if (orientDBInternal.isOpen) {
                orientDBInternal.close()
            }
            serverInternal.shutdown()
        }
    }

    /**
     * DBApi interface implementation
     */
    override fun <T : EntityType> getRecordId(type: KClass<T>, docUuid: String): String? {
        val typeImpl = getEntityTypeImpl(type)
        val queryString = "SELECT * FROM ${typeImpl.className} WHERE _id == '$docUuid'"
        val docs = dBFromThread.query(queryString)
        if (docs.hasNext()) {
            val doc = docs.next()
            if (!docs.hasNext()) {
                docs.close()
                return doc.identity.get().toString()
            } else {
                throw PersistenceException("There is more than one result for type: $type and docUuid: $docUuid")
            }
        }
        return null
    }

    override fun getRecordId(doc: JsonNode): String {
        return doc[DB_ID].asText()
    }

    override fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode? {
        val typeImpl = getEntityTypeImpl(type)
        val query = "SELECT @this.toJSON('rid,class,version') as jsonDoc FROM ${typeImpl.className} WHERE @rid = $id"
        val result = dBFromThread.query(query)
        val list = mapOResultSetToJson(result)
        result.close()
        if (list.size == 1) {
            return list[0]
        } else if (list.size > 1) {
            log.error("There are more than one documents with the same ID: $id")
        }
        return null
    }

    override fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode> {
        val typeImpl = getEntityTypeImpl(type)
        val oDocuments: ORecordIteratorClass<ODocument>
        oDocuments = dBFromThread.browseClass(typeImpl.className)
        return mapODocumentsToJsonNode(oDocuments)
    }

    override fun <T : EntityType> findAll(type: KClass<T>, query: List<QueryField>?, options: FindOptions?): FindAllResults {
        val typeImpl = getEntityTypeImpl(type)
        var queryString: String
        val countQuery: String
        if (query == null || query.isEmpty()) {
            queryString = "SELECT * FROM ${typeImpl.className}"
            countQuery = "SELECT count(*) FROM ${typeImpl.className}"
        } else {
            // TODO: try to use Elasticsearch as an alternative!
            val where = createWhereClause(query, options)
            val whereString = where.joinToString(separator = " " + (options?.queryOperator ?: "OR") + " ") { it }
            val fetchPlan = if (options?.resolveReferences == true) ",fetchPlan:*:-1" else ""
            queryString = if (options?.sortField != null) {
                "SELECT @this.toJSON('rid,class,version" + fetchPlan + "') as jsonDoc FROM ${typeImpl.className} LET \$temp = max( draft." + options.sortField + ", published." + options.sortField + " ) WHERE (" + whereString + ")"
            } else {
                "SELECT @this.toJSON('rid,class,version$fetchPlan') as jsonDoc FROM ${typeImpl.className} WHERE ($whereString)"
            }
            countQuery = "SELECT count(*) FROM ${typeImpl.className} WHERE ($whereString)"
            /*} else {
                String draftWhere = attachFieldToWhereList(where, "draft.");
                String publishedWhere = attachFieldToWhereList(where, "published.");
                queryString = "SELECT FROM DocumentWrapper WHERE (" + draftWhere + ") OR (draft IS NULL AND (" + publishedWhere + "))";
                countQuery = "SELECT count(*) FROM DocumentWrapper WHERE (" + draftWhere + ") OR (draft IS NULL AND (" + publishedWhere + "))";
            }*/
        }
        if (options?.sortField != null) {
            queryString += " ORDER BY \$temp " + options.sortOrder
        }
        if (options?.size != null) {
            queryString += " LIMIT " + options.size
        }
        log.debug("Query-String: $queryString")
        val docs = dBFromThread.query(queryString)
        val countDocs = dBFromThread.query(countQuery)
        docs.close()
        countDocs.close()
        return mapFindAllResults(docs, countDocs)
    }

    override fun <T : EntityType> countChildrenOfType(id: String, type: KClass<T>): Map<String, Long> {
        val typeImpl = getEntityTypeImpl(type)
        val response: MutableMap<String, Long> = HashMap()
        val query = "select _parent,count(_id) from ${typeImpl.className} " +
                "where _parent IN ['$id']" +
                "group by _parent"
        val countQuery = dBFromThread.query(query)
        while (countQuery.hasNext()) {
            val next = countQuery.next()
            response[next.getProperty(FIELD_PARENT)] = next.getProperty("count(_id)")
        }
        countQuery.close()
        return response
    }

    override fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String?): JsonNode {
        // TODO: we shouldn't use DB-ID but document ID here
        val doc = getById(type, id)
        val docToSave: ODocument

        // get record or a new document
        val typeImpl = getEntityTypeImpl(type)
        docToSave = doc
                .map { oResult: OResult -> oResult.record.get() as ODocument }
                .orElseGet { ODocument(typeImpl.className) }!!
        if (version != null) {
            docToSave.field("@version", version)
        }
        docToSave.fromJSON(data)
        val savedDoc = docToSave.save()
        try {
            return mapODocumentToJson(savedDoc, true)
        } catch (e: Exception) {
            log.error("Error saving document", e)
            throw PersistenceException("Error saving document" + e.message)
        }
    }

    override fun <T : EntityType> remove(type: KClass<T>, id: String): Boolean {
        val typeImpl = getEntityTypeImpl(type)
        val result = dBFromThread.command("select * from ${typeImpl.className} where _id = '$id'")

        val count = result.elementStream()
                .map { it.delete<ORecordAbstract>() }
                .count()
        log.debug("Deleted $count records of type: $type with _id: $id")

        result.close()
        if (count == 0L) {
            throw PersistenceException("Document cannot be deleted, since it wasn't found: ${typeImpl.className} -> $id")
        }
        return true
    }

    override fun <T : EntityType> remove(type: KClass<T>, query: Map<String, String>): Boolean {
        // TODO: finish implementation
        val typeImpl = getEntityTypeImpl(type)
        val command = dBFromThread.command("DROP CLASS ${typeImpl.className} IF EXISTS")
        command.close()
        return true
    }

    override val databases: Array<String>
        get() {
            return orientDB.list()
                    .filter { item: String -> !(item == DBApi.DATABASE.USERS.dbName || item == "OSystem" || item == "management") }
                    .toTypedArray()
        }

    override fun createDatabase(settings: Catalog): String? {
        settings.id = settings.name.toLowerCase().replace(" ".toRegex(), "_")
        orientDB.createIfNotExists(settings.id, dbType)
        acquireImpl(settings.id).use { session ->
            if (session == null) {
                throw PersistenceException("Failed to initialize database ${settings.id}")
            }
            OBehaviourType().initialize(session)
            OCatalogInfoType().initialize(session)

            val catInfo = ObjectMapper().createObjectNode()
            catInfo.put("id", settings.id)
            catInfo.put("name", settings.name)
            catInfo.put("description", settings.description)
            catInfo.put("type", settings.type)
            this.save(CatalogInfoType::class, null, catInfo.toString(), null)

            initDocumentTypes(settings)
        }
        return settings.id
    }

    override fun updateDatabase(settings: Catalog) {
        acquireImpl(settings.id).use {
            val list = this.findAll(CatalogInfoType::class)
            if (list == null || list.isEmpty()) {
                throw PersistenceException("No catalog info found in database ${settings.id}")
            }
            val map = list[0] as ObjectNode
            map.put("name", settings.name)
            map.put("description", settings.description)
            val id = map[DB_ID].asText()
            removeDBManagementFields(map)
            this.save(CatalogInfoType::class, id, map.toString(), null)
        }
    }

    override fun removeDatabase(name: String): Boolean {
        orientDB.drop(name)

        // TODO: remove database from all assigned users
        return true
    }

    override fun acquire(name: String?): Closeable? {
        return acquireImpl(name)
    }

    override fun beginTransaction() {
        dBFromThread.begin()
    }

    override fun commitTransaction() {
        try {
            dBFromThread.commit()
        } catch (ex: OConcurrentModificationException) {
            val id = ex.rid.toString()
            throw ConcurrentModificationException("Could not update object with id $id. The database version is newer than the record version.",
                    id, ex.enhancedDatabaseVersion, ex.enhancedRecordVersion)
        }
    }

    override fun rollbackTransaction() {
        dBFromThread.rollback()
    }

    /**
     * Private methods
     */
    private val dBFromThread: ODatabaseSession
        get() = ODatabaseRecordThreadLocal.instance().get()

    private fun acquireImpl(name: String?): ODatabaseSession? {
        if (!orientDB.exists(name)) {
            throw PersistenceException("Database does not exist: $name")
        }
        if (ODatabaseRecordThreadLocal.instance().ifDefined?.name.equals(name)) {
            // this could be caused by nested acquire calls
            return dBFromThread
        }
        return orientDB.open(name, serverUser, serverPassword)
    }

    /**
     * First time database initialization (will be skipped, if done already).
     */
    private fun setup() {
        // make sure the database for storing users and catalog information is there
        val alreadyExists = orientDB.exists(DBApi.DATABASE.USERS.dbName)
        if (!alreadyExists) {
            orientDB.create(DBApi.DATABASE.USERS.dbName, dbType)
            acquireImpl(DBApi.DATABASE.USERS.dbName).use { session ->
                if (session == null) {
                    throw PersistenceException("Failed to initialize database ${DBApi.DATABASE.USERS.dbName}")
                }
                OUserInfoType().initialize(session)
                session.commit()
            }
        }
    }

    /**
     * Initialize all document types on all given catalog databases.
     * Each document type handles creating a class and its special fields.
     */
    private fun initDocumentTypes(vararg settings: Catalog) {
        if (!::documentTypes.isInitialized) {
            return
        }
        for ((id, _, _, type) in settings) {
            acquireImpl(id).use { session ->
                if (session == null) {
                    throw PersistenceException("Failed to initialize document types in database $id")
                }
                documentTypes.filter { docType: OrientDBEntityType -> docType.usedInProfile(type) }
                        .forEach { t: OrientDBEntityType -> t.initialize(session) }
            }
        }
    }

    private fun <T : EntityType> getEntityTypeImpl(type: KClass<T>): OrientDBEntityType {
        if (!::entityTypeMap.isInitialized) {
            if (!::entityTypes.isInitialized) {
                throw PersistenceException("No entity types registered")
            }
            entityTypeMap = mutableMapOf()
            entityTypes.forEach { t: OrientDBEntityType ->
                (entityTypeMap as MutableMap<KClass<out EntityType>, OrientDBEntityType>)[t.entityType] = t
            }
        }
        return entityTypeMap[type] ?: throw PersistenceException("There is no entity type: $type registered")
    }

    private fun <T : EntityType> getById(type: KClass<T>, id: String?): Optional<OResult> {
        val typeImpl = getEntityTypeImpl(type)
        val query = "SELECT * FROM ${typeImpl.className} WHERE @rid = $id"
        val result = dBFromThread.query(query)
        val first = result.stream()
                .findFirst()
        result.close()
        return first
    }

    private fun createWhereClause(query: List<QueryField>, options: FindOptions?): List<String> {
        val where: MutableList<String> = ArrayList()
        for (field in query) {
            val key = field.field
            val value = field.value
            val invert = field.invert
            if (value == null) {
                where.add(key + ".toLowerCase() IS " + (if (invert) "NOT " else "") + "NULL")
            } else {
                var operator: String
                when (options?.queryType) {
                    QueryType.LIKE -> {
                        operator = if (invert) "not like" else "like"
                        where.add(key + ".toLowerCase() " + operator + " '%" + value.toLowerCase() + "%'")
                    }
                    QueryType.EXACT -> {
                        operator = if (invert) " !=" else " =="
                        where.add("$key$operator '$value'")
                    }
                    QueryType.CONTAINS -> {
                        operator = if (invert) " not contains" else " contains"
                        where.add("$key$operator '$value'")
                    }
                    else -> where.add("$key == '$value'")
                }
            }
        }
        return where
    }

    private fun attachFieldToWhereList(whereList: List<String>, field: String): String {
        return whereList.stream()
                .map { item: String -> field + item }
                .collect(Collectors.joining(" OR "))
    }

    private fun mapFindAllResults(docs: OResultSet, countDocs: OResultSet): FindAllResults {
        val hits = mapOResultSetToJson(docs)
        val count = countDocs.next().getProperty<Long>("count(*)")
        return FindAllResults(count, hits)
    }

    private fun mapOResultSetToJson(docs: OResultSet): List<JsonNode> {
        val list: MutableList<JsonNode> = ArrayList()
        while (docs.hasNext()) {
            val doc = docs.next()
            val json = doc.getProperty<String>("jsonDoc")
            val node = getJsonNode(json)
            list.add(node)
        }
        return list
    }

    private fun mapODocumentsToJsonNode(oDocsIterator: ORecordIteratorClass<ODocument>): List<JsonNode> {
        val list: MutableList<JsonNode> = ArrayList()
        while (oDocsIterator.hasNext()) {
            val next = oDocsIterator.next()
            list.add(getJsonNode(next.toJSON()))
        }
        return list
    }

    private fun mapODocumentToJson(oDoc: ODocument, resolveReferences: Boolean): JsonNode {
        val json: String = if (resolveReferences) {
            oDoc.toJSON("rid,class,version,fetchPlan:*:-1")
        } else {
            oDoc.toJSON("rid,class,version")
        }
        return getJsonNode(json)
    }
}