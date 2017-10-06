package de.ingrid.igeserver.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import de.ingrid.igeserver.OrientDbService;

@Service
public class JsonToDBService extends MapperService {

    @Autowired
    private OrientDbService dbService;

    public String mapDocument(String json, boolean published, String userId) throws Exception {
        ObjectNode map = (ObjectNode) getJsonMap( json );

        String id = map.path( FIELD_ID ).asText(null);

        String oldDoc = dbService.getById( "Documents", id );

        ObjectNode oldMap = null;

        if (oldDoc == null) {
            oldMap = new ObjectMapper().createObjectNode();
            oldMap.put( FIELD_PROFILE, map.path( FIELD_PROFILE ).asText() );
            oldMap.put( FIELD_PARENT, map.path( FIELD_PARENT ).asText(null) );
        } else {
            oldMap = (ObjectNode) getJsonMap( oldDoc );
        }

        map.put( FIELD_MODIFIED_BY, userId );

        // cleanup document to save
        map.remove( FIELD_ID );
        map.remove( FIELD_PROFILE );
        map.remove( FIELD_STATE );
        map.remove( FIELD_PARENT );

        if (published) {
            oldMap.put( "published", map );
            oldMap.remove( FIELD_DRAFT );
        } else {
            oldMap.put( FIELD_DRAFT, map );
        }

        // apply specific fields to document (id, profile, state, ...)
        oldMap.put( FIELD_ID, id );

        return toJsonString( oldMap );
    }

    public String prepareBehaviour(String json) throws Exception {
        JsonNode map = getJsonMap( json );

        // do transformation
        // jo.get( "active" );
        // jo.remove( "@rid" );
        // jo.remove( "@class" );
        // jo.remove( "@type" );
        // jo.remove( "@fieldTypes" );

        // return transformed json
        return toJsonString( map );

    }

    public String revertDocument(String id) throws Exception {
        String doc = dbService.getById( "Documents", id );

        ObjectNode map = (ObjectNode) getJsonMap( doc );
        map.remove( FIELD_DRAFT );

        return toJsonString( map );
    }

}
