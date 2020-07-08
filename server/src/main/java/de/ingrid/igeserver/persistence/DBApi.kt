package de.ingrid.igeserver.persistence

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import java.io.Closeable
import kotlin.reflect.KClass

interface DBApi {

    /**
     * Get the database record ID of a document of the given type and UUID.
     */
    fun <T : EntityType> getRecordId(type: KClass<T>, docUuid: String): String?

    /**
     * Get the database record ID of a document.
     */
    fun getRecordId(doc: JsonNode): String

    /**
     * Get a document of the given type with the given record ID.
     */
    fun <T : EntityType> find(type: KClass<T>, id: String?): JsonNode?

    /**
     * Get all documents of the given type.
     */
    fun <T : EntityType> findAll(type: KClass<T>): List<JsonNode?>?

    /**
     * Get all documents of the given type matching the given query.
     */
    fun <T : EntityType> findAll(type: KClass<T>, query: List<QueryField>?, options: FindOptions?): DBFindAllResults

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
     * Delete a document of the given type with the given record ID.
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
     * Create a database using the given name and return the name of the created database.
     */
    fun createDatabase(settings: Catalog): String?

    /**
     * Update an existing database with the given settings (like name property).
     */
    fun updateDatabase(settings: Catalog)

    /**
     * Delete the database with the given name.
     */
    fun removeDatabase(name: String): Boolean

    /**
     * Open a session to the database with the given name. With that it's possible to
     * begin, commit and rollback transactions.
     */
    fun acquire(name: String?): Closeable?
}