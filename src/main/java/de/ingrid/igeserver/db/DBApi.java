package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.ODatabaseSession;

import java.util.List;
import java.util.Map;

public interface DBApi {

    public static enum DBClass {Document, User, Role};

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
     */
    public List<Map> findAll(DBClass type, Map<String, String> query);

    /**
     * Save a document with a given ID.
     */
    public Map save(DBClass type, String id, Map<String, Object> data);

    /**
     * Delete a document with a given ID.
     */
    public boolean remove(String name);

    /**
     * Create a database with a given name.
     */
    public boolean createDB(String name);

    /**
     * Delete a database with a given name.
     */
    public boolean removeDB(String name);

    /**
     * Open a session to a database with name dbName. With that it's possible to
     * begin, commit and rollback transactions.
     */
    public ODatabaseSession acquire(String dbName);
}
