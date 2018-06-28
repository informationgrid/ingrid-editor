package de.ingrid.igeserver.services;

import java.text.SimpleDateFormat;
import java.util.Date;

import de.ingrid.igeserver.db.DBApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import de.ingrid.igeserver.services.db.OrientDbService;

@Service
public class JsonToDBService extends MapperService {

    @Autowired
    private DBApi dbService;

    public String mapDocument(String json, boolean published, String userId) throws Exception {
        ObjectNode map = (ObjectNode) getJsonMap( json );

        String id = map.path( FIELD_ID ).asText(null);

        String oldDoc = dbService.getById( "Documents", id );

        ObjectNode oldMap = null;
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");

        if (oldDoc == null) {
            oldMap = new ObjectMapper().createObjectNode();
            oldMap.put( FIELD_PROFILE, map.path( FIELD_PROFILE ).asText() );
            oldMap.put( FIELD_PARENT, map.path( FIELD_PARENT ).asText(null) );
            oldMap.put( FIELD_CREATED, format.format( new Date() ) );
            
        } else {
            oldMap = (ObjectNode) getJsonMap( oldDoc );
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
            oldMap.set( "published", map );
            oldMap.remove( FIELD_DRAFT );
        } else {
            oldMap.set( FIELD_DRAFT, map );
        }

        // apply specific fields to document (id, profile, state, ...)
        oldMap.put( FIELD_ID, id );

        return toJsonString( oldMap );
    }

    private void cleanupReferences(ObjectNode map) {
        // TODO: make dynamic
        String profile = map.get( MapperService.FIELD_PROFILE ).asText();
        if ("UVP".equals( profile ) ) {
            
            JsonNode publisher = map.get("publisher");
            if (publisher != null && !"".equals( publisher.textValue() )) {
                String id = publisher.get( MapperService.FIELD_ID ).asText();
                ObjectNode refNode = new ObjectMapper().createObjectNode();
                
                map.set( "publisher", refNode.put( MapperService.FIELD_ID, id ) );
            }
        }
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
