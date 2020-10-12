package de.ingrid.igeserver.persistence

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import java.io.Closeable
import kotlin.reflect.KClass

interface DBApi {

    enum class DATABASE(val dbName: String) {
        USERS("IgeUsers")
    }

    /**
     * Get the database record ID of a document of the given type and UUID.
     */
    fun <T : EntityType> getRecordId(type: KClass<T>, docUuid: String): String?

    /**
     * Get the database record ID of a document.
     */
    fun getRecordId(doc: JsonNode): String?

    /**
     * Get the database version of a document.
     */
    fun getVersion(doc: JsonNode): Int?

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
     * Get the number of children of the specified type belonging to the parent with the given record ID.
     */
    fun <T : EntityType> countChildrenOfType(id: String, type: KClass<T>): Map<String, Long>

    /**
     * Save the given data using the given type, record ID and version (like file uploads).
     * NOTE By omitting the version parameter the multi version concurrency control is disabled
     */
    fun <T : EntityType> save(type: KClass<T>, id: String?, data: String, version: String? = null): JsonNode

    /**
     * Delete a document of the given type with the given record ID. If multiple documents with same ID exist
     * then all will be removed. If none exists then a PersistenceException is thrown.
     */
    fun <T : EntityType> remove(type: KClass<T>, id: String): Boolean

    /**
     * Delete all documents of the given type matching the given query.
     */
    fun <T : EntityType> remove(type: KClass<T>, query: Map<String, String>): Boolean

    /**
     * Get all database names
     */
    val databases: Array<String>

    /**
     * Get currently opened database if any (see acquire())
     */
    val currentDatabase: String?

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
     * Open a session to the database with the given name. With that it's possible to
     * begin, commit and rollback transactions.
     */
    fun acquire(name: String): Closeable

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