package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.metadata.sequence.OSequence;
import com.orientechnologies.orient.core.metadata.sequence.OSequenceLibrary;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.plugin.OServerPluginManager;
import de.ingrid.igeserver.api.ApiException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.util.*;

@Service
public class OrientDBDatabase implements DBApi {

    private static Logger log = LogManager.getLogger(OrientDBDatabase.class);

    private OServer server = null;

    /**
     * DB init
     */

    public void setup() {

        Orient.instance().startup();

        // make sure the database for storing users and catalog information is there
        boolean alreadyExists = server.existsDatabase("IgeUsers"); // orientDB.createIfNotExists("IgeUsers", ODatabaseType.PLOCAL);
        if (!alreadyExists) {

            server.createDatabase("IgeUsers", ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());

            try (ODatabaseSession session = acquire("IgeUsers")) {
                // after creation the database is already connected to and can be used
                session.getMetadata().getSchema().createClass("Info");
                session.commit();
            }

            // after database creation we have to close orientDB to release resources correctly (login from studio)
            // orientDB.close();
            // openOrientDB();
        }
    }

    @PreDestroy
    void destroy() {
        log.info("Closing database before exit");
        server.shutdown();
    }

    @PostConstruct
    public void startServer() throws Exception {
        String orientdbHome = new File("").getAbsolutePath();
        System.setProperty("ORIENTDB_HOME", orientdbHome);
        if (server == null) {
            server = OServerMain.create(true);
        }

        log.info("Starting OrientDB Server");
        server.startup(getClass().getResourceAsStream("/db.config.xml"));
        OServerPluginManager manager = new OServerPluginManager();
        manager.config(server);
        server.activate();

        manager.startup();

        setup();
    }

    public void stop() {
        Orient.instance().shutdown();
    }

    /**
     * DB Actions
     */

    @Override
    public List<Map> findAll(DBClass type) {
        ORecordIteratorClass<ODocument> oDocuments = null;
        try {
            oDocuments = getDBFromThread().browseClass(type.name());
            return mapODocumentsToMap(oDocuments);
        } catch (Exception e) {
            // TODO: can this happen? "class Info not found"
            log.error(e);
            return null;
        }
    }

    @Override
    public List<Map> findAll(DBClass type, Map<String, String> query, boolean exactQuery) {
        String queryString;
        if (query == null || query.isEmpty()) {
            queryString = "SELECT * FROM " + type;
        } else {
            // select * from `Documents` where (draft.firstName like "%er%" or draft.lastName like "%es%")
            // TODO: try to use lucene index!
            List<String> where = new ArrayList<>();
            for (String key : query.keySet()) {
                String value = query.get(key);
                if (value == null) {
                    where.add(key + ".toLowerCase() IS NULL");
                } else if (exactQuery) {
                    where.add(key + ".toLowerCase() like '" + value.toLowerCase() + "'");
                } else {
                    where.add(key + ".toLowerCase() like '%" + value.toLowerCase() + "%'");
                }
            }
            queryString = "SELECT * FROM " + type + " WHERE (" + String.join(" or ", where) + ")";
        }


        OResultSet docs = getDBFromThread().query(queryString);
        return mapODocumentsToMap(docs);
    }

    @Override
    public Object getRecordId(DBClass dbClass, Map<String, String> query) throws ApiException {
        List<Map> behaviorFromDB = this.findAll(DBApi.DBClass.Behaviours, query, true);

        if (behaviorFromDB.size() == 1) {
            return behaviorFromDB.get(0).get("@rid");
        } else if (behaviorFromDB.size() > 1) {
            throw new ApiException("There is more than one result for dbClass: " + dbClass.name() + " query: " + query.toString());
        }

        return null;
    }

    @Override
    public Map find(DBClass type, String id) {
        String query = "SELECT * FROM " + type + " WHERE @rid = " + id;
//        String query = "SELECT * FROM " + type + " WHERE _id = " + id;

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
    public Map save(DBClass type, @Deprecated String dbDocId, Map<String, Object> data) {
        ODocument docToSave;
        ORecordId recId = ((ORecordId) data.get("@rid"));

        if (recId == null) {
            docToSave = new ODocument(type.name());
        } else {
            String id = recId.toString();
            Optional<OResult> doc = getById(type, id);
            docToSave = (ODocument) doc.get().getRecord().get();

        }

        // if it's a new document
        // docToSave = doc.map(oResult -> (ODocument) oResult.getRecord().get()).orElseGet(() -> new ODocument(type.name()));

        // map data
        // TODO: can the update be done differently?
        for (String key : data.keySet()) {
            // ignore @rid since it contains the version which might be obsolete by now
            // we also do not want to change the dbDocId manually!
            if ("@rid".equals(key)) continue;

            docToSave.field(key, data.get(key));
        }

        docToSave.save();
        return docToSave.toMap();
    }

    @Override
    public Map save(DBClass type, String id, Object data) {
        Optional<OResult> doc = getById(type, id);
        ODocument docToSave;

        // if it's a new document
        docToSave = doc.map(oResult -> (ODocument) oResult.getRecord().get()).orElseGet(() -> new ODocument(type.name()));

        docToSave.save();
        return docToSave.toMap();
    }

    @Override
    public boolean remove(DBClass type, String name) {
        return false;
    }

    @Override
    public List<String> remove(DBClass type, Map<String, String> query) {
        // TODO: implement
        return null;
    }

    @Override
    public String[] getDatabases() {
        return server.listDatabases().stream()
                .filter(item -> !(item.equals("IgeUsers") || item.equals("OSystem") || item.equals("management")))
                .toArray(String[]::new);
    }

    @Override
    public boolean createDatabase(String name) throws ApiException {
        server.createDatabase(name, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        try (ODatabaseSession session = acquire(name)) {
            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            OClass docClass = session.getMetadata().getSchema().createClass("Documents");
            docClass.createProperty("_id", OType.INTEGER);
            docClass.createProperty("_parent", OType.INTEGER);
            docClass.createIndex("didIdx", OClass.INDEX_TYPE.UNIQUE, "_id");

            OSequenceLibrary sequenceLibrary = session.getMetadata().getSequenceLibrary();
            if (sequenceLibrary.getSequence("idseq") == null) {
                OSequence seq = sequenceLibrary.createSequence("idseq", OSequence.SEQUENCE_TYPE.ORDERED, new OSequence.CreateParams().setStart(0l).setIncrement(1));
                seq.save();

                // TODO: CREATE INDEX items.ID ON items (ID) UNIQUE
            }

            session.getMetadata().getSchema().createClass("Behaviours");
            session.getMetadata().getSchema().createClass("Info");

            Map<String, Object> catInfo = new HashMap<>();
            catInfo.put("name", "New Catalog");
            this.save(DBClass.Info, null, catInfo);
        }

        return true;
    }

    @Override
    public boolean removeDatabase(String name) {
        server.dropDatabase(name);
        return true;
    }

    @Override
    public ODatabaseSession acquire(String dbName) {
        return server.openDatabase(dbName);
        /*if (poolMap.containsKey(dbName)) {
            return poolMap.get(dbName).acquire();
        } else {
            ODatabasePool pool = new ODatabasePool(orientDB, dbName, "admin", "admin");
            poolMap.put(dbName, pool);
            return pool.acquire();
        }*/
    }

    /**
     * Private methods
     */
    private ODatabaseSession getDBFromThread() {
        return ODatabaseRecordThreadLocal.instance().get();
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
