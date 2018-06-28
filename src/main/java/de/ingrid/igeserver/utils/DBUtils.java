package de.ingrid.igeserver.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.ingrid.igeserver.db.DBApi;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.services.db.OrientDbService;

@Service
public class DBUtils {
    
    private static Logger log = LogManager.getLogger( DBUtils.class );

    @Autowired
    private DBApi dbService;

    public String getCatalogForUser(String userId) {
        Map<String, String> query = new HashMap<>();
        query.put( "id", userId );

        // TODO: use cache!

        List<String> list = this.dbService.findAll( DBApi.DBClass.User, "info", query, "catalogId" );
        
        if (list.size() == 0) {
            String msg = "The user does not seem to be assigned to any database: " + userId;
            log.error( msg );
        }

        return list.size() == 0 ? null : list.get( 0 );
    }

    public String[] getReferencedDocs(JsonNode mapDoc) {
        List<String> refNodes = new ArrayList<>();

        String profile = mapDoc.get( MapperService.FIELD_PROFILE ).asText();

        // TODO: make it dynamic
        if ("UVP".equals( profile )) {

            // TODO: use info map for each document type, which references it has and receive reference Id
            JsonNode publisher = mapDoc.get( "publisher" );
            
            if (publisher != null && !"".equals( publisher.textValue() )) {
                String refId = publisher.get( MapperService.FIELD_ID ).asText();
                
                // TODO: get referenced document in a loop
                Map refJson = this.dbService.find(DBApi.DBClass.Document, refId );
                
                refNodes.add( refJson );
            }
        }
        
        return refNodes.toArray( new String[0] );
    }

}
