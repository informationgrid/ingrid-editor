package de.ingrid.igeserver.persistence

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import java.io.Closeable
import kotlin.reflect.KClass

interface DBApi {

    enum class DATABASE(val dbName: String) {
        USERS("IgeUsers"),
        AUDIT_LOG("AuditLog")
    }

    /**
     * Get the database record ID of a document of the given type and an document ID.
     * NOTE The id is a domain specific identifier that is used to distinguish instances of the same type,
     * e.g. UUID for document wrappers or name for behaviours. If a type does not define a identifier an exception
     * will be thrown.
     */
    fun <T : EntityType> getRecordId(type: KClass<T>, docId: String): String?

    /**
     * Get the database record ID of a document.
     */
    fun getRecordId(doc: JsonNode): String?

    /**
     * Get the number of children belonging to the parent with the given document ID.
     */
    fun countChildren(docId: String): Long

    /**
     * Remove the internal fields added by the database from a document.
     */
    fun removeInternalFields(doc: JsonNode)

    /**
     * Get a document of the given type with the given record ID.
     */
    fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode?

    /**
     * Get all documents of the given type.
     */
    fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode>

    /**
     * Get all documents of the given type matching the given query.
     */
    fun <T : EntityType> findAll(type: KClass<T>, query: List<QueryField>?, options: FindOptions): FindAllResults

    /**
     * Get all documents of the given type matching the combination of the given queries.
     */
    fun <T : EntityType> findAllExt(type: KClass<T>, queries: List<Pair<List<QueryField>?, QueryOptions>>, options: FindOptions): FindAllResults

    /**
     * Save the given data using the given type, record ID and version (like file uploads).
     * NOTE By omitting the version parameter the multi version concurrency control is disabled
     */
    fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String? = null): JsonNode

    /**
     * Delete a document of the given type with the given document ID. If multiple documents with same ID exist
     * then all will be removed. If none exists then a PersistenceException is thrown.
     */
    fun <T : EntityType> remove(type: KClass<T>, docId: String): Boolean

    /**
     * Get all catalog names
     */
    val catalogs: Array<String>

    /**
     * Get currently opened catalog if any (see acquireCatalog())
     */
    val currentCatalog: String?

    /**
     * Create a catalog using the given name and return the name of the created catalog.
     */
    fun createCatalog(settings: Catalog): String?

    /**
     * Update an existing catalog with the given settings (like name property).
     */
    fun updateCatalog(settings: Catalog)

    /**
     * Delete the catalog with the given name.
     */
    fun removeCatalog(name: String): Boolean

    /**
     * Check if the catalog with the given name exists
     */
    fun catalogExists(name: String): Boolean

    /**
     * Execute any sql (used for migration tasks)
     */
    fun execSQL(sql: String)
    
    /**
     * Open a session to the catalog with the given name. With that it's possible to
     * begin, commit and rollback transactions.
     */
    fun acquireCatalog(name: String): Closeable

    /**
     * Open a session to the database with the given name. With that it's possible to
     * begin, commit and rollback transactions.
     * NOTE If the name parameter is significant or ignored depends on the implementation
     */
    fun acquireDatabase(name: String = ""): Closeable

    /**
     * Start a transaction in the acquired session
     */
    fun beginTransaction()

    /**
     * Commit the transaction in the acquired session
     */
    fun commitTransaction()

    /**
     * Rollback the transaction in the acquired session
     */
    fun rollbackTransaction()
}
