package de.ingrid.igeserver.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.OrientDbService;
import de.ingrid.igeserver.services.MapperService;

@Service
public class DBUtils {

    @Autowired
    private OrientDbService dbService;

    public String getCatalogForUser(String userId) {
        Map<String, String> query = new HashMap<String, String>();
        query.put( "id", userId );

        // TODO: use cache!

        List<String> list = this.dbService.find( "users", "info", query, "catalogId" );

        return list.size() == 0 ? null : list.get( 0 );
    }

    public String[] getReferencedDocs(JsonNode mapDoc) {
        List<String> refNodes = new ArrayList<String>();

        String profile = mapDoc.get( MapperService.FIELD_PROFILE ).asText();

        // TODO: make it dynamic
        if ("UVP".equals( profile )) {

            // TODO: use info map for each document type, which references it has and receive reference Id
            JsonNode publisher = mapDoc.get( "publisher" );
            
            if (!"".equals( publisher.textValue() )) {
                String refId = publisher.get( MapperService.FIELD_ID ).asText();
                
                // TODO: get referenced document in a loop
                String refJson = this.dbService.getById( "Documents", refId );
                
                refNodes.add( refJson );
            }
        }
        
        return refNodes.toArray( new String[0] );
    }

}
