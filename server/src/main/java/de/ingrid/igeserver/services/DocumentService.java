package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.db.DBFindAllResults;
import de.ingrid.igeserver.db.FindOptions;
import de.ingrid.igeserver.db.QueryType;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.DOCUMENT_WRAPPER;

@Service
public class DocumentService extends MapperService {

    private static Logger log = LogManager.getLogger(DocumentService.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    public Map prepareDocumentFromDB(Map result, Object wrapper) {
        return prepareDocumentFromDB(result, wrapper, null);
    }

    public JsonNode updateParent(String dbDoc, String parent) throws Exception {
        ObjectNode map = (ObjectNode) getJsonMap(dbDoc);
        map.put(FIELD_PARENT, parent);

        return map;
    }

    /**
     * Transform a document from the database and map only the relevant data needed for the frontend.
     *
     * @param map    contains all fields for a document in a HashMap
     * @param fields contains those fields that we want to request, if null then all fields are returned
     * @return a HashMap transformed for frontend usage
     */
    public Map prepareDocumentFromDB(Map map, Object wrapperMap, String[] fields) {
        // JsonNode map = getJsonMap( dbDoc );

        Map<String, Object> currentDoc = map;

        // if fields are defined, then filter only those from the document
        if (fields != null) {
            currentDoc.keySet().retainAll(Arrays.asList(fields));
        }

        // apply specific fields to document (id, profile, state, ...)
        // make sure the IDs are of type String, which is more universal
        //currentDoc.put(FIELD_ID, String.valueOf(map.get(FIELD_ID)));
//        currentDoc.put(PARENT_ID, map.get(PARENT_ID));
//        currentDoc.put(FIELD_PROFILE, map.get("@class"));
        currentDoc.put(FIELD_STATE, determineState(wrapperMap));
//        currentDoc.put(FIELD_HAS_CHILDREN, map.get(FIELD_HAS_CHILDREN));
        //currentDoc.put(FIELD_CREATED, map.get(FIELD_CREATED));
        //currentDoc.put(FIELD_MODIFIED, map.get(FIELD_MODIFIED));

        currentDoc.remove("@class");
        currentDoc.remove("@rid");

        return currentDoc;
    }

    /**
     * Transform a json string, coming from the frontend, to a HashMap used by the database API.
     *
     * @param json      is the data of the document in json format
     * @param published if true then the document will be prepared as a published document otherwise as working version
     * @param userId    is the ID of the user who performs the action
     * @return a HashMap containing the transformed document ready to be inserted into the database
     */
    public Map mapDocumentToDatabase(String json, boolean published, String userId) throws ApiException {
        // ObjectNode map = (ObjectNode) getJsonMap( json );
        Map<String, Object> newDocument = dbUtils.getMapFromObject(json);

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");

        Map<String, Object> currentDoc = getDocOrInitialize(newDocument, format);


        newDocument.put(FIELD_MODIFIED_BY, userId);


        // remove all referenced data except the ID
        // this data is fetched on each load (TODO: should be cached!)
        cleanupReferences(newDocument);

        // cleanup document to save
        newDocument.remove(FIELD_ID);
        newDocument.remove(FIELD_PROFILE);
        newDocument.remove(FIELD_STATE);
        newDocument.remove(FIELD_PARENT);

        if (published) {
            currentDoc.put(FIELD_PUBLISHED, newDocument);
            currentDoc.remove(FIELD_DRAFT);
        } else {
            currentDoc.put(FIELD_DRAFT, newDocument);
        }

        // apply specific fields to document (id, profile, state, ...)
        // the ID is automatically generated and applied -> oldMap.put( FIELD_ID, id );

        return currentDoc;
    }

    private Map<String, Object> getDocOrInitialize(Map<String, Object> newDocument, SimpleDateFormat format) throws ApiException {
        String id = String.valueOf(newDocument.get(FIELD_ID));
        // get database id from doc id  or just query for correct document then we also get the rid!
        Map<String, String> query = new HashMap<>();
        query.put("_id", id);
        FindOptions findOptions = new FindOptions();
        findOptions.queryType = QueryType.exact;
        findOptions.resolveReferences = false;
        DBFindAllResults docInDatabase = dbService.findAll(DOCUMENT_WRAPPER, query, findOptions);

        Map<String, Object> currentDoc;

        if (docInDatabase.totalHits == 0) {
            currentDoc = new HashMap<>();
            currentDoc.put(FIELD_PROFILE, newDocument.get(FIELD_PROFILE));
            currentDoc.put(FIELD_PARENT, newDocument.get(FIELD_PARENT));
            currentDoc.put(FIELD_CREATED, format.format(OffsetDateTime.now()));

        } else if (docInDatabase.totalHits == 1) {
            try {
                currentDoc = getMapFromObject(docInDatabase.hits.get(0));
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        } else {
            throw new ApiException("Document to be updated exists multiple times: " + id);
        }

        // TODO: should we store modified/create date in wrapper or actual data document?
        currentDoc.put(FIELD_MODIFIED, format.format(OffsetDateTime.now()));
        return currentDoc;
    }

    private void cleanupReferences(Map<String, Object> map) {
        // TODO: make dynamic
        String profile = (String) map.get(MapperService.FIELD_PROFILE);
        if ("UVP".equals(profile)) {

            Map publisher = (Map) map.get("publisher");
            if (publisher != null) {
                String id = (String) publisher.get(MapperService.FIELD_ID);
                Map<String, Object> refNode = new HashMap<>();

                map.put("publisher", refNode.put(MapperService.FIELD_ID, id));
            }
        }
    }

    public String determineState(Object map) {
        boolean draft = false;
        boolean published = false;
        if (map instanceof Map) {
            draft = ((Map) map).get(FIELD_DRAFT) != null;
            published = ((Map) map).get(FIELD_PUBLISHED) != null;
        } else if (map instanceof JsonNode) {
            draft = !((JsonNode) map).get(FIELD_DRAFT).isNull();
            published = !((JsonNode) map).get(FIELD_PUBLISHED).isNull();
        }
        if (published && draft) {
            return "PW";
        } else if (published) {
            return "P";
        } else {
            return "W";
        }
    }

    public void addReferencedDocsTo(String[] refDocs, Map mapDoc) {
        for (String ref : refDocs) {
            try {
                // TODO: mapDoc.set("publisher", prepareDocumentFromDB(ref));
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }

    public JsonNode getByDocId(String id, boolean withReferences) {

        Map<String, String> query = new HashMap<>();
        query.put(FIELD_ID, id);
        FindOptions findOptions = new FindOptions();
        findOptions.queryType = QueryType.exact;
        findOptions.resolveReferences = withReferences;
        DBFindAllResults docs = this.dbService.findAll(DOCUMENT_WRAPPER, query, findOptions);
        try {
            return docs.totalHits > 0 ? getJsonMap(docs.hits.get(0)) : null;
        } catch (Exception e) {
            log.error("Error getting document by ID: " + id, e);
            return null;
        }
    }

    public ObjectNode getDocumentWrapper() {
        ObjectNode docWrapper = new ObjectMapper().createObjectNode();
        //docWrapper.put(FIELD_ID, UUID.randomUUID());
        docWrapper.put(FIELD_DRAFT, (String) null);
        docWrapper.put(FIELD_PUBLISHED, (String) null);
        docWrapper.putArray(FIELD_ARCHIVE);
        return docWrapper;
    }

    public boolean determineHasChildren(JsonNode doc) {
        String id = doc.get(FIELD_ID).asText();
        Map<String, Long> countMap = this.dbService.countChildrenFromNode(id);
        if (countMap.containsKey(id)) {
            return countMap.get(id) > 0;
        }
        return false;
    }
}
