package de.ingrid.igeserver.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.services.MapperService;

@Service
public class DBUtils {
    
    private static Logger log = LogManager.getLogger( DBUtils.class );

    @Autowired
    private DBApi dbService;

    public String getCatalogForUser(String userId) {
        Map<String, String> query = new HashMap<>();
        query.put( "id", userId );

        // TODO: use cache!
        try (ODatabaseSession session = this.dbService.acquire("IgeUser")) {
            List<Map> list = this.dbService.findAll(DBApi.DBClass.User, query);

            if (list.size() == 0) {
                String msg = "The user does not seem to be assigned to any database: " + userId;
                log.error(msg);
            }

            return list.size() == 0 ? null : (String) list.get(0).get("catalogId");
        }
    }

    public String[] getReferencedDocs(Map mapDoc) {
        List<String> refNodes = new ArrayList<>();

        String profile = (String) mapDoc.get( MapperService.FIELD_PROFILE );

        // TODO: make it dynamic
        if ("UVP".equals( profile )) {

            // TODO: use info map for each document type, which references it has and receive reference Id
            Map publisher = (Map) mapDoc.get( "publisher" );
            
            if (publisher != null) {
                String refId = (String) publisher.get( MapperService.FIELD_ID );
                
                // TODO: get referenced document in a loop
                Map refJson = this.dbService.find(DBApi.DBClass.Documents, refId );

                // TODO: map to json string
                refNodes.add( refJson.toString() );
            }
        }
        
        return refNodes.toArray( new String[0] );
    }

    public Map<String, Object> getMapFromObject(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.valueToTree(object);
    }

    public String toJsonString(Object map) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.writeValueAsString( map );
    }

}
