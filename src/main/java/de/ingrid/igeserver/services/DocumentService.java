package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

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
        currentDoc.put(FIELD_ID, (Integer) map.get(FIELD_ID));
        currentDoc.put(FIELD_PROFILE, (String) map.get(FIELD_PROFILE));
        currentDoc.put(FIELD_STATE, determineState(map));
        currentDoc.put(FIELD_HAS_CHILDREN, (Boolean) map.get(FIELD_HAS_CHILDREN));
        currentDoc.put(FIELD_CREATED, (String) map.get(FIELD_CREATED));
        currentDoc.put(FIELD_MODIFIED, (String) map.get(FIELD_MODIFIED));

        return currentDoc;
    }

    /**
     * Transform a json string, coming from the frontend, to a HashMap used by the database API.
     * @param json is the data of the document in json format
     * @param published if true then the document will be prepared as a published document otherwise as working version
     * @param userId is the ID of the user who performs the action
     * @return a HashMap containing the transformed document ready to be inserted into the database
     */
    public Map mapDocumentToDatabase(String json, boolean published, String userId) {
        // ObjectNode map = (ObjectNode) getJsonMap( json );
        Map<String, Object> map = dbUtils.getMapFromObject(json);

        String id = (String) map.get( FIELD_ID );

        Map<String, Object> oldDoc = dbService.find( DBApi.DBClass.Documents, id );

        Map<String, Object> oldMap;
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");

        if (oldDoc == null) {
            oldMap = new HashMap<>();
            oldMap.put( FIELD_PROFILE, (String) map.get( FIELD_PROFILE ));
            oldMap.put( FIELD_PARENT, (Integer) map.get( FIELD_PARENT ));
            oldMap.put( FIELD_CREATED, format.format( new Date() ) );

        } else {
            oldMap = oldDoc;
        }

        map.put( FIELD_MODIFIED_BY, userId );

        // TODO: should we store modified/create date in wrapper or actual data document?
        oldMap.put( FIELD_MODIFIED, format.format( new Date() ) );

        // remove all referenced data except the ID
        // this data is fetched on each load (TODO: should be cached!)
        cleanupReferences( map );

        // cleanup document to save
        map.remove( FIELD_ID );
        map.remove( FIELD_PROFILE );
        map.remove( FIELD_STATE );
        map.remove( FIELD_PARENT );

        if (published) {
            oldMap.put( FIELD_PUBLISHED, map );
            oldMap.remove( FIELD_DRAFT );
        } else {
            oldMap.put( FIELD_DRAFT, map );
        }

        // apply specific fields to document (id, profile, state, ...)
        oldMap.put( FIELD_ID, id );

        return dbUtils.getMapFromObject(oldMap);
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
}
