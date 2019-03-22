package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class MapperService {
    
    public static final String FIELD_STATE = "_state";
    public static final String FIELD_PROFILE = "_profile";
    public static final String FIELD_ID = "_id";
    public static final String PARENT_ID = "_parent";
    public static final String FIELD_CREATED = "_created";
    public static final String FIELD_MODIFIED = "_modified";
    public static final String FIELD_HAS_CHILDREN = "_hasChildren";
    public static final String FIELD_PARENT = "_parent";
    public static final String FIELD_MODIFIED_BY = "_modifiedBy";
    public static final String FIELD_DRAFT = "draft";
    public static final String FIELD_PUBLISHED = "published";
    public static final String FIELD_ARCHIVE = "archive";

    public static JsonNode getJsonMap(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.readTree(json);
    }
    public static Map getMapFromJson(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.convertValue(json, Map.class);
    }

    public static Map<String, Object> getMapFromObject(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        // return mapper.valueToTree(object);
        try {
            if (object instanceof String) {
                return mapper.readValue((String) object, HashMap.class);
            } else {
                return  mapper.convertValue(object, HashMap.class);
            }
        } catch (IOException e) {
            // log.error(e);
            return null;
        }
    }

    public JsonNode getJsonMap(Map map) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.valueToTree(map);
    }

    /**
     * Use DBUtils class method
     * @param map
     * @return
     * @throws Exception
     */
    @Deprecated()
    public String toJsonString(Object map) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.writeValueAsString( map );
    }
    
    /**
     * Remove all fields add by database for internal management. Those are @rid, @class, @type, @fieldTypes.
     * @param jsonMap
     */
    public void removeDBManagementFields(ObjectNode jsonMap) {
        jsonMap.remove( "@rid" );
        jsonMap.remove( "@class" );
        jsonMap.remove( "@type" );
        jsonMap.remove( "@fieldTypes" ); 
    }
    
}
