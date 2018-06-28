package de.ingrid.igeserver.db;

import com.orientechnologies.orient.client.remote.OServerAdmin;
import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.plugin.OServerPluginManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.util.*;

public class OrientDBDatabase implements DBApi {

    private static Logger log = LogManager.getLogger(OrientDBDatabase.class);

    private OServer server = null;

    public void setOrientDB(OrientDB orientDB) {
        this.orientDB = orientDB;
    }

    private OrientDB orientDB;

    private static Map<String, ODatabasePool> poolMap = new HashMap<>();

    /**
     * DB init
     */

    public void setup() {
        Orient.instance().startup();
    }

    void destroy() {
        OrientDBDatabase.poolMap.values().forEach(pool -> pool.close());
    }

    public void startServer() throws Exception {
        String orientdbHome = new File("").getAbsolutePath();
        System.setProperty("ORIENTDB_HOME", orientdbHome);
        if (server == null) {
            server = OServerMain.create();
        }

        log.info("Starting OrientDB Server");
        server.startup(getClass().getResourceAsStream("/db.config.xml"));
        OServerPluginManager manager = new OServerPluginManager();
        manager.config(server);
        server.activate();

        manager.startup();

        this.orientDB = new OrientDB("embedded:./databases/", OrientDBConfig.defaultConfig());
    }

    public void stop() {
        Orient.instance().shutdown();
    }

    /**
     * DB Actions
     */

    @Override
    public List<Map> findAll(DBClass type) {
        ORecordIteratorClass<ODocument> oDocuments = getDBFromThread().browseClass(type.name());
        List<Map> list = mapODocumentsToMap(oDocuments);
        return list;
    }

    @Override
    public List<Map> findAll(DBClass type, Map<String, String> query) {
        OSQLSynchQuery<ODocument> oQuery;
        String queryString = "";
        if (query == null) {
            queryString = "SELECT * FROM " + type;
        } else {
            // select * from `Documents` where (draft.firstName like "%er%" or draft.lastName like "%es%")
            // TODO: try to use lucene index!
            List<String> where = new ArrayList<>();
            for (String key: query.keySet()) {
                String value = query.get(key);
                if (value == null) {
                    where.add(key + ".toLowerCase() IS NULL");
                } else {
                    where.add(key + ".toLowerCase() like '%" + value.toLowerCase() + "%'");
                }
            }
            queryString = "SELECT * FROM " + type + " WHERE (" + String.join(" or ", where) + ")";
        }


        OResultSet docs = getDBFromThread().query(queryString);
        List<Map> list = mapODocumentsToMap(docs);
        return list;
    }

    @Override
    public Map find(DBClass type, String id) {
        String query = "SELECT * FROM " + type + " WHERE @rid = " + id;

        OResultSet result = getDBFromThread().query(query);
        List<Map> list = mapODocumentsToMap(result);

        if (list.size() == 1) {

            return list.get(0);

        } else if (list.size() > 1) {

            log.error("There are more than one documents with the same ID: " + id);
            return null;

        }
        return null;
    }

    @Override
    public Map save(DBClass type, String id, Map<String, Object> data) {
        Optional<OResult> doc = getById(type, id);
        ODocument docToSave;

        // if it's a new document
        if (doc.isPresent()) {
            docToSave = (ODocument) doc.get().getRecord().get();
        } else {
            docToSave = new ODocument(type.name());
        }

        // map data
        for (String key: data.keySet()) {
            docToSave.field(key, data.get(key));
        }

        docToSave.save();
        return docToSave.toMap();
    }

    @Override
    public boolean remove(String name) {
        orientDB.drop(name);
        return true;
    }


    @Override
    public String[] getDatabases() {
        OServerAdmin oServerAdmin;
        try {
            oServerAdmin = new OServerAdmin( "remote:localhost" );
            oServerAdmin.connect( "root", "root" );
            return oServerAdmin.listDatabases().keySet().toArray( new String[0] );
        } catch (Exception e) {
            log.error( "Error connecting to OrientDB server to get all databases.", e );
        }
        return null;
    }

    @Override
    public boolean createDatabase(String name) {
        orientDB.create(name, ODatabaseType.PLOCAL);
        return true;
    }

    @Override
    public boolean removeDatabase(String name) {
        return false;
    }

    @Override
    public ODatabaseSession acquire(String dbName) {
        if (poolMap.containsKey(dbName)) {
            return poolMap.get(dbName).acquire();
        } else {
            ODatabasePool pool = new ODatabasePool(orientDB, dbName, "admin", "admin");
            poolMap.put(dbName, pool);
            return pool.acquire();
        }
    }

    /**
     * Private methods
     */
    private ODatabaseSession getDBFromThread() {
        return ODatabaseRecordThreadLocal.instance().get();
    }

    private List<Map> mapODocumentsToMap(List<ODocument> oDocs) {
        return mapODocumentsToMap((ORecordIteratorClass<ODocument>) oDocs.iterator());
    }

    private List<Map> mapODocumentsToMap(ORecordIteratorClass<ODocument> oDocsIterator) {
        List<Map> list = new ArrayList<>();
        while (oDocsIterator.hasNext()) {
            ODocument next = oDocsIterator.next();
            list.add(next.toMap());
        }

        return list;
    }

    private List<Map> mapODocumentsToMap(OResultSet docs) {
        List<Map> list = new ArrayList<>();
        while (docs.hasNext()) {
            ODocument oDoc = (ODocument) docs.next().getElement().get();
            list.add(oDoc.toMap());
        }

        return list;
    }

    private Optional<OResult> getById(DBClass type, String id) {
        String query = "SELECT * FROM " + type + " WHERE @rid = " + id;

        OResultSet result = getDBFromThread().query(query);
        return result.stream()
                .findFirst();
    }
}
