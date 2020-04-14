package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.ORecordAbstract;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.plugin.OServerPluginManager;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.exceptions.DatabaseDoesNotExistException;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.services.MapperService;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrientDBDatabase implements DBApi {

    public static String DB_ID = "@rid";

    private static Logger log = LogManager.getLogger(OrientDBDatabase.class);

    @Autowired
    List<DocumentType> documentTypes;

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
                OClass info = session.getMetadata().getSchema().createClass("Info");
                info.createProperty("userId", OType.STRING);
                info.createProperty("currentCatalogId", OType.STRING);
                info.createProperty("catalogIds", OType.EMBEDDEDLIST, OType.STRING);
                session.commit();
            }

            // after database creation we have to close orientDB to release resources correctly (login from studio)
            // orientDB.close();
            // openOrientDB();
        }

        // initDocumentTypes(getCatalogSettings());
    }

    /**
     * Initialize all document types on all databases/catalogs.
     * This has to be done only once during startup, but might be optimized
     * by versioning.
     * <p>
     * Each document type handles creating a class and its special fields.
     */
    private void initDocumentTypes(Catalog... settings) {

        for (Catalog dbSetting : settings) {
            try (ODatabaseSession session = acquire(dbSetting.id)) {
                documentTypes.stream()
                        .filter(docType -> docType.usedInProfile(dbSetting.type))
                        .forEach(type -> type.initialize(session));
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
    public List<JsonNode> findAll(DBClass type) {
        ORecordIteratorClass<ODocument> oDocuments;
        try {
            oDocuments = getDBFromThread().browseClass(type.name());
            return mapODocumentsToJsonNode(oDocuments);
        } catch (Exception e) {
            // TODO: can this happen? "class Info not found"
            log.error(e);
            return null;
        }
    }

    @Override
    public DBFindAllResults findAll(String type, Map<String, String> query, FindOptions options) throws Exception {
        String queryString;
        String countQuery;

        if (query == null || query.isEmpty()) {
            queryString = "SELECT * FROM " + type;
            countQuery = "SELECT count(*) FROM " + type;
        } else {
            // TODO: try to use Elasticsearch as an alternative!
            List<String> where = createWhereClause(query, options);
            String whereString = String.join(" OR ", where);

            String fetchPlan = options.resolveReferences ? ",fetchPlan:*:-1" : "";

            if ( options.sortField != null){
                queryString = "SELECT @this.toJSON('rid,class" + fetchPlan + "') as jsonDoc FROM " + type + " LET $temp = max( draft."+options.sortField+", published."+options.sortField+" ) WHERE (" + whereString + ")";
            }else{
                queryString = "SELECT @this.toJSON('rid,class" + fetchPlan + "') as jsonDoc FROM " + type + " WHERE (" + whereString + ")";
            }
            countQuery = "SELECT count(*) FROM " + type + " WHERE (" + whereString + ")";
            /*} else {
                String draftWhere = attachFieldToWhereList(where, "draft.");
                String publishedWhere = attachFieldToWhereList(where, "published.");
                queryString = "SELECT FROM DocumentWrapper WHERE (" + draftWhere + ") OR (draft IS NULL AND (" + publishedWhere + "))";
                countQuery = "SELECT count(*) FROM DocumentWrapper WHERE (" + draftWhere + ") OR (draft IS NULL AND (" + publishedWhere + "))";
            }*/

        }

        if (options.sortField != null) {
            queryString += " ORDER BY $temp " + options.sortOrder;
        }
        if (options.size != null) {
            queryString += " LIMIT " + options.size;
        }
        log.debug("Query-String: " + queryString);

        OResultSet docs = getDBFromThread().query(queryString);
        OResultSet countDocs = getDBFromThread().query(countQuery);

        return mapFindAllResults(docs, countDocs);

    }

    private List<String> createWhereClause(Map<String, String> query, FindOptions options) {
        List<String> where = new ArrayList<>();
        for (String key : query.keySet()) {
            String value = query.get(key);
            if (value == null) {
                where.add(key + ".toLowerCase() IS NULL");
            } else {
                switch (options.queryType) {
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
        return where;
    }

    private String attachFieldToWhereList(List<String> whereList, String field) {
        return whereList.stream()
                .map(item -> field + item)
                .collect(Collectors.joining(" OR "));
    }

    private DBFindAllResults mapFindAllResults(OResultSet docs, OResultSet countDocs) throws Exception {

        List<JsonNode> hits = mapODocumentsToJSON(docs);
        long count = countDocs.next().getProperty("count(*)");
        return new DBFindAllResults(count, hits);
    }

    @Override
    public String getRecordId(String dbClass, String docUuid) throws ApiException {
        String queryString = "SELECT * FROM " + dbClass + " WHERE _id == '" + docUuid + "'";
        OResultSet docs = getDBFromThread().query(queryString);

        if (docs.hasNext()) {
            OResult doc = docs.next();
            if (!docs.hasNext()) {
                return doc.getIdentity().get().toString();
            } else {
                throw new ApiException("There is more than one result for dbClass: " + dbClass + " docUuid: " + docUuid);
            }
        } else {
            return null;
        }
    }

    @Override
    public Map<String, Long> countChildrenFromNode(String id, String type) {
        Map<String, Long> response = new HashMap<>();
        String query = "select _parent,count(_id) from " + type + " " +
                "where _parent IN ['" + id + "']" +
                "group by _parent";

        OResultSet countQuery = getDBFromThread().query(query);
        while (countQuery.hasNext()) {
            OResult next = countQuery.next();
            response.put(next.getProperty(MapperService.FIELD_PARENT), next.getProperty("count(_id)"));
        }
        return response;
    }

    @Override
    public int count(String type, Map<String, String> query, FindOptions findOptions) {
        return 0;
    }

    @Override
    public JsonNode find(String type, String id) throws Exception {
        String query = "SELECT @this.toJSON('rid,class') as jsonDoc FROM " + type + " WHERE @rid = " + id;
//        String query = "SELECT * FROM " + type + " WHERE _id = " + id;

        OResultSet result = getDBFromThread().query(query);
        List<JsonNode> list = mapODocumentsToJSON(result);

        if (list.size() == 1) {

            return list.get(0);

        } else if (list.size() > 1) {

            log.error("There are more than one documents with the same ID: " + id);
            return null;

        }
        return null;
    }

    /**
     * Is this still used? data is not used in function!
     *
     * @param type
     * @param id
     * @param data
     * @return
     */
    @Override
    public JsonNode save(String type, String id, String data) throws ApiException {
        Optional<OResult> doc = getById(type, id);
        ODocument docToSave;

        // if it's a new document
        docToSave = doc
                .map(oResult -> (ODocument) oResult.getRecord().get())
                .orElseGet(() -> new ODocument(type));

        docToSave.fromJSON(data);

        docToSave.save();
        try {
            return mapODocumentToJson(docToSave, true);
        } catch (Exception e) {
            log.error("Error saving document", e);
            throw new ApiException("Error saving document" + e.getMessage());
        }
    }

    @Override
    public boolean remove(String type, String id) throws ApiException {
        OResultSet result = getDBFromThread().command("select * from " + type + " where _id = '" + id + "'");

        OElement record = result.elementStream()
                .reduce((a, b) -> {
                    throw new IllegalStateException("Multiple elements: " + a + ", " + b);
                })
                .orElseGet(null);

        if (record == null) {
            throw new ApiException("Dockument cannot be deleted, since it wasn't found: " + type + " -> " + id);
        }
        ORecordAbstract deleteResponse = record.delete();
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
    public String createDatabase(Catalog catalog) throws ApiException {
        catalog.id = this.generateDBNameFromLabel(catalog.name);

        server.createDatabase(catalog.id, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        try (ODatabaseSession session = acquire(catalog.id)) {

            initNewDatabase(catalog, session);
            JsonNode catInfo = getMapFromCatalogSettings(catalog);
            this.save(DBClass.Info.name(), null, catInfo.toString());
        }

        initDocumentTypes(catalog);

        return catalog.id;
    }

    public void updateDatabase(Catalog settings) throws ApiException {
        try (ODatabaseSession ignored = acquire(settings.id)) {

            List<JsonNode> list = this.findAll(DBClass.Info);
            ObjectNode map = (ObjectNode) list.get(0);
            map.put("name", settings.name);
            map.put("description", settings.description);
            String id = map.get(DB_ID).asText();
            MapperService.removeDBManagementFields(map);
            this.save(DBClass.Info.name(), id, map.toString());
        }
    }

    private JsonNode getMapFromCatalogSettings(Catalog settings) {
        ObjectNode catInfo = new ObjectMapper().createObjectNode();
        catInfo.put("id", settings.id);
        catInfo.put("name", settings.name);
        catInfo.put("description", settings.description);
        catInfo.put("type", settings.type);
        return catInfo;
    }

    private void initNewDatabase(Catalog settings, ODatabaseSession session) {
        session.getMetadata().getSchema().createClass("Behaviours");
        OClass info = session.getMetadata().getSchema().createClass("Info");

        info.createProperty("name", OType.STRING);
        info.createProperty("type", OType.STRING);
        info.createProperty("version", OType.STRING);
    }

    private String generateDBNameFromLabel(String name) {
        return name.toLowerCase().replaceAll(" ", "_");
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

    private List<JsonNode> mapODocumentsToJsonNode(ORecordIteratorClass<ODocument> oDocsIterator) throws Exception {
        List<JsonNode> list = new ArrayList<>();
        while (oDocsIterator.hasNext()) {
            ODocument next = oDocsIterator.next();
            list.add(MapperService.getJsonNode(next.toJSON()));
        }

        return list;
    }

    private List<JsonNode> mapODocumentsToJSON(OResultSet docs) throws Exception {
        List<JsonNode> list = new ArrayList<>();
        while (docs.hasNext()) {
            OResult doc = docs.next();
            String json = doc.getProperty( "jsonDoc" );
            JsonNode node = MapperService.getJsonNode(json);
            list.add(node);
        }

        return list;
    }

    private JsonNode mapODocumentToJson(ODocument oDoc, boolean resolveReferences) throws Exception {
        String json;
        if (resolveReferences) {
            json = oDoc.toJSON("rid,class,fetchPlan:*:-1");
        } else {
            json = oDoc.toJSON("rid,class");
        }
        return MapperService.getJsonNode(json);
    }

    /**
     * DEPRECATED OR NOT: Type not needed since all documents are stored in 'documents' class!?
     *
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
