package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.db.DBFindAllResults;
import de.ingrid.igeserver.db.FindOptions;
import de.ingrid.igeserver.db.QueryType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DocumentService extends MapperService {

    private static Logger log = LogManager.getLogger(DocumentService.class);

    @Autowired
    private DBApi dbService;

    public JsonNode updateParent(String dbDoc, String parent) throws Exception {
        ObjectNode map = (ObjectNode) getJsonNode(dbDoc);
        map.put(FIELD_PARENT, parent);

        return map;
    }

    public String determineState(JsonNode node) {
        boolean draft = !node.get(FIELD_DRAFT).isNull();
        boolean published = !node.get(FIELD_PUBLISHED).isNull();

        if (published && draft) {
            return "PW";
        } else if (published) {
            return "P";
        } else {
            return "W";
        }
    }

    public JsonNode getByDocId(String id, String type, boolean withReferences) throws Exception {

        Map<String, String> query = new HashMap<>();
        query.put(FIELD_ID, id);
        FindOptions findOptions = new FindOptions();
        findOptions.queryType = QueryType.exact;
        findOptions.resolveReferences = withReferences;
        DBFindAllResults docs = this.dbService.findAll(type, query, findOptions);

        if (docs.totalHits != 1) {
            log.error("A Document_Wrapper could not be found or is not unique for UUID: " + id + " (got " + docs.totalHits + ")");
            throw new RuntimeException("No unique document wrapper found");
        }

        try {
            return docs.hits.get(0);
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

    public boolean determineHasChildren(JsonNode doc, String type) {
        String id = doc.get(FIELD_ID).asText();
        Map<String, Long> countMap = this.dbService.countChildrenFromNode(id, type);
        if (countMap.containsKey(id)) {
            return countMap.get(id) > 0;
        }
        return false;
    }

    public ObjectNode getLatestDocument(JsonNode doc) {
        String state = determineState(doc);
        JsonNode docData = doc.get(FIELD_DRAFT);

        if (docData.isNull()) {
            docData = doc.get(FIELD_PUBLISHED);
        }

        ((ObjectNode)docData).put(FIELD_STATE, state);

        return (ObjectNode) docData;
    }
}
