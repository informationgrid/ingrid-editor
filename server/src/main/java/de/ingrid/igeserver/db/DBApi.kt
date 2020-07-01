package de.ingrid.igeserver.db

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import java.io.Closeable

interface DBApi {
    @Throws(ApiException::class)
    fun getRecordId(dbClass: String, docUuid: String): String?
    fun countChildrenFromNode(id: String?, type: String): Map<String, Long>

    /**
     * Get the ID of a document.
     */
    fun getRecordId(doc: JsonNode): String

    /**
     * Count number of documents found with findAll method
     * @param type
     * @param query
     * @param findOptions
     * @return
     */
    fun count(type: String, query: Map<String, String>?, findOptions: FindOptions?): Int
    enum class DBClass {
        Documents, User, Role, Info, Behaviours
    }

    /**
     * Find a document of a certain type with a given ID.
     */
    @Throws(Exception::class)
    fun find(type: String, id: String?): JsonNode?

    /**
     * Get all documents of a certain type.
     * @param type
     */
    fun findAll(type: String?): List<JsonNode?>?

    /**
     * Get all documents of a certain type that matches a given query.
     * @return
     */
    @Throws(Exception::class)
    fun findAll(type: String, query: List<QueryField>?, options: FindOptions?): DBFindAllResults

    /**
     * Save a raw object with a given ID (like file uploads).
     * @return
     */
    @Throws(ApiException::class)
    fun save(type: String, dbDocId: String?, data: String): JsonNode

    /**
     * Delete a document with a given ID.
     */
    @Throws(ApiException::class)
    fun remove(type: String, id: String): Boolean

    /**
     * Delete documents that match a given query.
     *
     * @return a list of IDs of the deleted documents
     */
    fun remove(type: String, query: Map<String, String>): Boolean

    /**
     * Get all databases
     * @return an array of database names
     */
    val databases: Array<String>

    /**
     * Create a database with a given name.
     * @return the generated database name
     */
    @Throws(ApiException::class)
    fun createDatabase(settings: Catalog?): String?

    /**
     * Update an existing database, like name property.
     * @param settings
     */
    @Throws(ApiException::class)
    fun updateDatabase(settings: Catalog?)

    /**
     * Delete a database with a given name.
     */
    fun removeDatabase(name: String?): Boolean

    /**
     * Open a session to a database with name dbName. With that it's possible to
     * begin, commit and rollback transactions.
     */
    fun acquire(dbName: String?): Closeable?
}