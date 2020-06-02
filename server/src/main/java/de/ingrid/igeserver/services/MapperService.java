package de.ingrid.igeserver.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.model.Behaviour;

public class MapperService {

    public static final String FIELD_STATE = "_state";
    public static final String FIELD_DOCUMENT_TYPE = "_type";
    public static final String FIELD_ID = "_id";
    public static final String PARENT_ID = "_parent";
    public static final String FIELD_CREATED = "_created";
    public static final String FIELD_MODIFIED = "_modified";
    public static final String FIELD_HAS_CHILDREN = "_hasChildren";
    public static final String FIELD_PARENT = "_parent";
    public static final String FIELD_CATEGORY = "_category";
    public static final String FIELD_MODIFIED_BY = "_modifiedBy";
    public static final String FIELD_DRAFT = "draft";
    public static final String FIELD_PUBLISHED = "published";
    public static final String FIELD_ARCHIVE = "archive";

    public static JsonNode getJsonNode(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.readTree(json);
    }

    public static String getJsonNodeFromClass(Behaviour clazz) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(clazz);
    }

    /**
     * Remove all fields add by database for internal management. Those are @rid, @class, @type, @fieldTypes.
     *
     * @param node
     */
    public static void removeDBManagementFields(ObjectNode node) {
        node.remove("@rid");
        node.remove("@class");
        node.remove("@type");
        node.remove("@version");
    }

}
