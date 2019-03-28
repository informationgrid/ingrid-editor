package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.api.ApiException;

import java.util.List;
import java.util.Map;

public interface DBApi {

    Object getRecordId(String dbClass, Map<String, String> query) throws ApiException;

    public static enum DBClass {Documents, User, Role, Info, Behaviours};

    /**
     * Find a document of a certain type with a given ID.
     */
    public Map find(DBClass type, String id);

    /**
     * Get all documents of a certain type.
     */
    public List<Map> findAll(DBClass type);

    /**
     * Get all documents of a certain type that matches a given query.
     * @return
     */
    public List<String> findAll(String type, Map<String, String> query, boolean exactQuery, boolean resolveReferences);

    /**
     * Save a document with a given ID.
     *
     * @param type is the database class (table)
     * @param dbDocId  is the ID of the document given by the database system
     * @param data contains the data to be stored
     */
    @Deprecated
    Map save(String type, String dbDocId, Map<String, Object> data);


    /**
     * Save a raw object with a given ID (like file uploads).
     */
    Map save(String type, String dbDocId, String data);

    /**
     * Delete a document with a given ID.
     */
    public boolean remove(DBClass type, String id);

    /**
     * Delete documents that match a given query.
     *
     * @return a list of IDs of the deleted documents
     */
    public List<String> remove(DBClass type, Map<String, String> query);


    /**
     * Get all databases
     * @return an array of database names
     */
    public String[] getDatabases();

    /**
     * Create a database with a given name.
     */
    public boolean createDatabase(String name) throws ApiException;

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
