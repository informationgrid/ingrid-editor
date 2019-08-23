package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.record.ORecordAbstract;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.plugin.OServerPluginManager;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.exceptions.DatabaseDoesNotExistException;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.util.*;

@Service
public class OrientDBDatabase implements DBApi {

    public static String DB_ID = "@rid";

    private static Logger log = LogManager.getLogger(OrientDBDatabase.class);

    @Autowired
    List<DocumentType> documentTypes;

    private OServer server = null;

    private OSQLSynchQuery<ODocument> docIdQuery = new OSQLSynchQuery<>(
            "SELECT FROM Documents WHERE _id = ?"
    );

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

        initDocumentTypes(getDatabases());
    }

    /**
     * Initialize all document types on all databases/catalogs.
     * This has to be done only once during startup, but might be optimized
     * by versioning.
     *
     * Each document type handles creating a class and its special fields.
     */
    private void initDocumentTypes(String... databases) {

        for (String db : databases) {
            try (ODatabaseSession session = acquire(db)) {
                documentTypes.forEach(type -> type.initialize(session));
            }
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
    public List<String> findAll(String type, Map<String, String> query, QueryType queryType, boolean resolveReferences) {
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
                } else {
                    switch (queryType) {
                        case like:
                            where.add(key + ".toLowerCase() like '%" + value.toLowerCase() + "%'");
                            break;
                        case exact:
                            where.add(key + " == '" + value + "'");
                            break;
                        case contains:
                            where.add(key + " contains '" + value + "'");
                            break;
                    }
                }
            }
            queryString = "SELECT * FROM " + type + " WHERE (" + String.join(" or ", where) + ")";
        }


        OResultSet docs = getDBFromThread().query(queryString);
        return mapODocumentsToJSON(docs, resolveReferences);
    }

    @Override
    public Object getRecordId(String dbClass, Map<String, String> query) throws ApiException {
        List<String> behaviorFromDB = this.findAll(dbClass, query, QueryType.exact, false);

        if (behaviorFromDB.size() == 1) {
            return null; //behaviorFromDB.get(0).get("@rid");
        } else if (behaviorFromDB.size() > 1) {
            throw new ApiException("There is more than one result for dbClass: " + dbClass + " query: " + query.toString());
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
    @Deprecated
    public Map save(String type, String dbDocId, Map<String, Object> data) {
        ODocument docToSave;
//        ORecordId recId = ((ORecordId) data.get("@rid"));

        /*docToSave = new ODocument(type);

        if (dbDocId != null) {
            docToSave.field(DB_ID, dbDocId);
        }*/


        if (dbDocId == null) {
            docToSave = new ODocument(type);
        } else {
            Optional<OResult> doc = getById(type, dbDocId);
            docToSave = (ODocument) doc.get().getRecord().get();

        }

        docToSave.fromMap(data);

        // if it's a new document
        // docToSave = doc.map(oResult -> (ODocument) oResult.getRecord().get()).orElseGet(() -> new ODocument(type.name()));

        // map data
        // TODO: can the update be done differently?
        /*for (String key : data.keySet()) {
            // ignore @rid since it contains the version which might be obsolete by now
            // we also do not want to change the dbDocId manually!
            if ("@rid".equals(key)) continue;

            docToSave.field(key, data.get(key));
        }*/

        docToSave.save();
        return docToSave.toMap();
    }

    /**
     * Is this still used? data is not used in function!
     * @param type
     * @param id
     * @param data
     * @return
     */
    @Override
    public Map save(String type, String id, String data) {
        Optional<OResult> doc = getById(type, id);
        ODocument docToSave;


        // if it's a new document
        docToSave = doc
                .map(oResult -> (ODocument) oResult.getRecord().get())
                .orElseGet(() -> new ODocument(type));

        docToSave.fromJSON(data);

        docToSave.save();
        return docToSave.toMap();
    }

    @Override
    public boolean remove(DBClass type, String id) {
        List<ODocument> result = getDBFromThread().command(docIdQuery).execute(id);

        assert result.size() == 1;

        ORecordAbstract deleteResponse = result.get(0).delete();
        return true;
    }

    @Override
    public List<String> remove(DBClass type, Map<String, String> query) {
        // TODO: implement
        throw new NotImplementedException("Remove function is not implemented yet");
    }

    @Override
    public String[] getDatabases() {
        return server.listDatabases().stream()
                .filter(item -> !(item.equals("IgeUsers") || item.equals("OSystem") || item.equals("management")))
                .toArray(String[]::new);
    }

    @Override
    public boolean createDatabase(String name) {
        server.createDatabase(name, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        try (ODatabaseSession session = acquire(name)) {

            session.getMetadata().getSchema().createClass("Behaviours");
            session.getMetadata().getSchema().createClass("Info");

            Map<String, Object> catInfo = new HashMap<>();
            catInfo.put("name", "New Catalog");
            this.save(DBClass.Info.name(), null, catInfo);

        }

        initDocumentTypes(name);

        return true;
    }

    @Override
    public boolean removeDatabase(String name) {
        server.dropDatabase(name);

        // TODO: remove database from all assigned users

        return true;
    }

    @Override
    public ODatabaseSession acquire(String dbName) {
        if (!server.existsDatabase(dbName)) {
            throw new DatabaseDoesNotExistException("Database does not exist: " + dbName);
        }
        return server.openDatabase(dbName);
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

    private List<String> mapODocumentsToJSON(OResultSet docs, boolean resolveReferences) {
        List<String> list = new ArrayList<>();
        while (docs.hasNext()) {
            ODocument oDoc = (ODocument) docs.next().getElement().get();
            if (resolveReferences) {
                list.add(oDoc.toJSON("rid,class,fetchPlan:*:-1"));
            } else {
                list.add(oDoc.toJSON("rid,class"));
            }
        }

        return list;
    }

    /**
     * DEPRECATED OR NOT: Type not needed since all documents are stored in 'documents' class!?
     * @param type
     * @param id
     * @return
     */
    @Deprecated()
    private Optional<OResult> getById(String type, String id) {
        String query = "SELECT * FROM " + type + " WHERE @rid = " + id;

        OResultSet result = getDBFromThread().query(query);
        return result.stream()
                .findFirst();
    }
}
