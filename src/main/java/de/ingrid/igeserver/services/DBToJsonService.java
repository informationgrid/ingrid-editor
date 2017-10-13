package de.ingrid.igeserver.services;

import java.util.Arrays;
import java.util.List;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class DBToJsonService extends MapperService {
    
    private static Logger log = LogManager.getLogger( DBToJsonService.class );

    public JsonNode mapDocument(String dbDoc) throws Exception {
        return mapDocument( dbDoc, null );
    }

    public JsonNode mapDocument(String dbDoc, String[] fields) throws Exception {
        JsonNode map = getJsonMap( dbDoc );

        JsonNode currentDocRead = map.path( "draft" );
        if (currentDocRead.isMissingNode()) {
        	currentDocRead = map.path( "published" );
        	
        	if (currentDocRead.isMissingNode()) {
        	    log.warn( "A document does not have draft or published version: " + dbDoc );
        	    return null;
        	}
        }
        ObjectNode currentDoc = (ObjectNode) currentDocRead;

        // if fields are defined, then filter only those from the document
        if (fields != null) {
            List<String> fieldList = Arrays.asList( fields );
            // TODO: currentDoc.keySet().retainAll( fieldList );
        }

        // apply specific fields to document (id, profile, state, ...)
        currentDoc.put( FIELD_ID, map.path( FIELD_ID ).asText() );
        currentDoc.put( FIELD_PROFILE, map.path( FIELD_PROFILE ).asText() );
        currentDoc.put( FIELD_STATE, determineState( map ) );
        currentDoc.put( FIELD_HAS_CHILDREN, map.path( FIELD_HAS_CHILDREN ).asText() );

        return currentDoc;
    }

    private String determineState(JsonNode map) {
    	JsonNode draft = map.path( "draft" );
        JsonNode published = map.path( "published" );
        if (!published.isMissingNode() && !draft.isMissingNode()) {
            return "PW";
        } else if (published.isMissingNode()) {
            return "P";
        } else {
            return "W";
        }
    }

    public void addReferencedDocsTo(String[] refDocs, ObjectNode mapDoc) {
        for (String ref : refDocs) {
            try {
                mapDoc.set( "publisher", mapDocument( ref ) );
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        
    }
}
