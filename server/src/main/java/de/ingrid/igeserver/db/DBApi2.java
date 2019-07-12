package de.ingrid.igeserver.db;

import java.util.Map;

public interface DBApi2 {


    /**
     * The document types the database supports.
     *
     *
     */
    public static enum EntityType {Catalog, Datasets, User, Role, Info, Behaviours};



    /**
     * Initialises the database server.
     *
     */
    public void init() throws Exception;


    /**
     * Shutdown the database server.
     *
     *
     */
    public void shutdown();


    /**
     * Create a persistence storage for a database.
     *
     * @param database
     * @param conf
     */
    public void createDatabase(String database, Map<String, Object> conf);


    /**
     * Get a DBSession for a certain database type.
     *
     * @param database
     * @return
     */
    public DbSession getSession(String database);



}
