package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class MapperService {
    
    public static final String FIELD_STATE = "_state";
    public static final String FIELD_PROFILE = "_profile";
    public static final String FIELD_ID = "_id";
    public static final String FIELD_CREATED = "_created";
    public static final String FIELD_MODIFIED = "_modified";
    public static final String FIELD_HAS_CHILDREN = "_hasChildren";
    public static final String FIELD_PARENT = "_parent";
    public static final String FIELD_MODIFIED_BY = "_modifiedBy";
    public static final String FIELD_DRAFT = "draft";
    
    public JsonNode getJsonMap(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.readTree(json);
    }
    
    public String toJsonString(JsonNode jsonMap) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.writeValueAsString( jsonMap );
    }
    
}
