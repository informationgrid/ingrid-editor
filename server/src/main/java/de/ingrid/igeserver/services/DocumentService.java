package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class DocumentService extends MapperService {

    private static Logger log = LogManager.getLogger(DocumentService.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    public Map mapDocumentFromDatabase(Map dbDoc) {
        return mapDocumentFromDatabase(dbDoc, null);
    }

    public JsonNode updateParent(String dbDoc, String parent) throws Exception {
        ObjectNode map = (ObjectNode) getJsonMap(dbDoc);
        map.put(FIELD_PARENT, parent);

        return map;
    }

    /**
     * Transform a document from the database and map only the relevant data needed for the frontend.
     *
     * @param map contains all fields for a document in a HashMap
     * @param fields contains those fields that we want to request, if null then all fields are returned
     * @return a HashMap transformed for frontend usage
     */
    public Map mapDocumentFromDatabase(Map map, String[] fields) {
        // JsonNode map = getJsonMap( dbDoc );

        Map<String, Object> currentDocRead = (Map) map.get("draft");
        if (currentDocRead == null) {
            currentDocRead = (Map) map.get("published");

            if (currentDocRead == null) {
                log.warn("A document does not have draft or published version: ", map);
                return null;
            }
        }
        Map<String, Object> currentDoc = currentDocRead;

        // if fields are defined, then filter only those from the document
        if (fields != null) {
            currentDoc.keySet().retainAll( Arrays.asList( fields ) );
        }

        // apply specific fields to document (id, profile, state, ...)
        // make sure the IDs are of type String, which is more universal
        currentDoc.put(FIELD_ID, String.valueOf(map.get(FIELD_ID)));
        currentDoc.put(PARENT_ID, String.valueOf(map.get(PARENT_ID)));
        currentDoc.put(FIELD_PROFILE, map.get(FIELD_PROFILE));
        currentDoc.put(FIELD_STATE, determineState(map));
        currentDoc.put(FIELD_HAS_CHILDREN, map.get(FIELD_HAS_CHILDREN));
        currentDoc.put(FIELD_CREATED, map.get(FIELD_CREATED));
        currentDoc.put(FIELD_MODIFIED, map.get(FIELD_MODIFIED));

        return currentDoc;
    }

    /**
     * Transform a json string, coming from the frontend, to a HashMap used by the database API.
     * @param json is the data of the document in json format
     * @param published if true then the document will be prepared as a published document otherwise as working version
     * @param userId is the ID of the user who performs the action
     * @return a HashMap containing the transformed document ready to be inserted into the database
     */
    public Map mapDocumentToDatabase(String json, boolean published, String userId) throws ApiException {
        // ObjectNode map = (ObjectNode) getJsonMap( json );
        Map<String, Object> newDocument = dbUtils.getMapFromObject(json);

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");

        Map<String, Object> currentDoc = getDocOrInitialize(newDocument, format);


        newDocument.put( FIELD_MODIFIED_BY, userId );


        // remove all referenced data except the ID
        // this data is fetched on each load (TODO: should be cached!)
        cleanupReferences( newDocument );

        // cleanup document to save
        newDocument.remove( FIELD_ID );
        newDocument.remove( FIELD_PROFILE );
        newDocument.remove( FIELD_STATE );
        newDocument.remove( FIELD_PARENT );

        if (published) {
            currentDoc.put( FIELD_PUBLISHED, newDocument );
            currentDoc.remove( FIELD_DRAFT );
        } else {
            currentDoc.put( FIELD_DRAFT, newDocument );
        }

        // apply specific fields to document (id, profile, state, ...)
        // the ID is automatically generated and applied -> oldMap.put( FIELD_ID, id );

        return currentDoc;
    }

    private Map<String, Object> getDocOrInitialize(Map<String, Object> newDocument, SimpleDateFormat format) throws ApiException {
        String id = String.valueOf(newDocument.get( FIELD_ID ));
        // get database id from doc id  or just query for correct document then we also get the rid!
        Map<String, String> query = new HashMap<>();
        query.put("_id", id);
        List<Map> docInDatabase = dbService.findAll( DBApi.DBClass.Documents, query, true);

        Map<String, Object> currentDoc;

        if (docInDatabase.size() == 0) {
            currentDoc = new HashMap<>();
            currentDoc.put( FIELD_PROFILE, newDocument.get( FIELD_PROFILE ));
            currentDoc.put( FIELD_PARENT, newDocument.get( FIELD_PARENT ));
            currentDoc.put( FIELD_CREATED, format.format( new Date() ) );

        } else if (docInDatabase.size() == 1){
            currentDoc = docInDatabase.get(0);
        } else {
            throw new ApiException("Document to be updated exists multiple times: " + id);
        }

        // TODO: should we store modified/create date in wrapper or actual data document?
        currentDoc.put( FIELD_MODIFIED, format.format( new Date() ) );
        return currentDoc;
    }

    private void cleanupReferences(Map<String, Object> map) {
        // TODO: make dynamic
        String profile = (String) map.get( MapperService.FIELD_PROFILE );
        if ("UVP".equals( profile ) ) {

            Map publisher = (Map) map.get("publisher");
            if (publisher != null) {
                String id = (String) publisher.get( MapperService.FIELD_ID );
                Map<String, Object> refNode = new HashMap<>();

                map.put( "publisher", refNode.put( MapperService.FIELD_ID, id ) );
            }
        }
    }

    private String determineState(Map map) {
        Map draft = (Map) map.get("draft");
        Map published = (Map) map.get("published");
        if (published != null && draft != null) {
            return "PW";
        } else if (published == null) {
            return "W";
        } else {
            return "P";
        }
    }

    public void addReferencedDocsTo(String[] refDocs, Map mapDoc) {
        for (String ref: refDocs) {
            try {
                // TODO: mapDoc.set("publisher", mapDocumentFromDatabase(ref));
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }

    public Map getByDocId(String id) {

        Map<String, String> query = new HashMap<>();
        query.put("_id", id);
        List<Map> docs = this.dbService.findAll(DBApi.DBClass.Documents, query, true);
        return docs.size() > 0 ? docs.get(0) : null;
    }
}
