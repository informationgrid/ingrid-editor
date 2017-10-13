package de.ingrid.igeserver.api;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import de.ingrid.igeserver.OrientDbService;
import de.ingrid.igeserver.services.JsonToDBService;
import io.swagger.annotations.ApiParam;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class BehavioursApiController implements BehavioursApi {

    @Autowired
    private OrientDbService dbService;
    
    @Autowired
    private JsonToDBService jsonService;

    public ResponseEntity<String> getBehaviours() {
        try {
            List<String> behaviours = this.dbService.getAllFrom( "Behaviours" );
            
            // String prepareBehaviour = jsonService.prepareBehaviour( behaviours.get( 0 ) );

            return ResponseEntity.ok( "[" + String.join( ",", behaviours ) + "]" );
        } catch (Exception e) {

            return new ResponseEntity<String>( HttpStatus.INTERNAL_SERVER_ERROR );
        }
    }

    public ResponseEntity<String> setBehaviours(@ApiParam(value = "", required = true) @Valid @RequestBody String behaviour) {
        try {
            String doc = this.dbService.addOrUpdateDocTo( "Behaviours", behaviour );
            return ResponseEntity.ok(doc);

        } catch (Exception e) {
            // TODO: log.error
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }
    }
    
    public ResponseEntity<Void> getBehavioursOp() {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

}
