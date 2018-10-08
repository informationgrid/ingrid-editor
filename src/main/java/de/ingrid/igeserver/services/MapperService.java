package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;

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

    public JsonNode getJsonMap(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.readTree(json);
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
