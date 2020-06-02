package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.model.Catalog;

import java.util.List;
import java.util.Map;

public interface DBApi {

    String getRecordId(String dbClass, String docUuid) throws ApiException;

    Map<String, Long> countChildrenFromNode(String id, String type);

    /**
     * Count number of documents found with findAll method
     * @param type
     * @param query
     * @param findOptions
     * @return
     */
    int count(String type, Map<String, String> query, FindOptions findOptions);

    public static enum DBClass {Documents, User, Role, Info, Behaviours};

    /**
     * Find a document of a certain type with a given ID.
     */
    public JsonNode find(String type, String id) throws Exception;

    /**
     * Get all documents of a certain type.
     * @param type
     */
    public List<JsonNode> findAll(String type);

    /**
     * Get all documents of a certain type that matches a given query.
     * @return
     */
    public DBFindAllResults findAll(String type, Map<String, String> query, FindOptions options) throws Exception;

    /**
     * Save a raw object with a given ID (like file uploads).
     * @return
     */
    JsonNode save(String type, String dbDocId, String data) throws ApiException;

    /**
     * Delete a document with a given ID.
     */
    public boolean remove(String type, String id) throws ApiException;

    /**
     * Delete documents that match a given query.
     *
     * @return a list of IDs of the deleted documents
     */
    public boolean remove(String type, Map<String, String> query);


    /**
     * Get all databases
     * @return an array of database names
     */
    public String[] getDatabases();

    /**
     * Create a database with a given name.
     * @return the generated database name
     */
    public String createDatabase(Catalog settings) throws ApiException;

    /**
     * Update an existing database, like name property.
     * @param settings
     */
    public void updateDatabase(Catalog settings) throws ApiException;

    /**
     * Delete a database with a given name.
     */
    public boolean removeDatabase(String name);

    /**
     * Open a session to a database with name dbName. With that it's possible to
     * begin, commit and rollback transactions.
     */
    ODatabaseSession acquire(String dbName);
}
