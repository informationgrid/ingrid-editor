package de.ingrid.igeserver.api;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

import de.ingrid.igeserver.db.DBApi;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.annotations.ApiParam;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class BehavioursApiController implements BehavioursApi {

    @Autowired
    private DBApi dbService;
    
    //@Autowired
    //private JsonToDBService jsonService;

    public ResponseEntity<List<JSONObject>> getBehaviours(Principal principal) {
        System.out.println(principal == null ? "principal is null" : "principal is " + principal.getName());
        
        List<Map> behaviours = this.dbService.findAll( DBApi.DBClass.Behavior );

        // String prepareBehaviour = jsonService.prepareBehaviour( behaviours.get( 0 ) );
        // TODO: map behaviours to JSON
        List<JSONObject> collect = behaviours.stream().map(b -> new JSONObject(b)).collect(Collectors.toList());

        return ResponseEntity.ok( collect ); //"[" + String.join( ",", behaviours ) + "]" );
    }

    public ResponseEntity<String> setBehaviours(@ApiParam(value = "", required = true) @Valid @RequestBody String behaviour) {
        try {
            String id = "???";
            String doc = this.dbService.save(DBApi.DBClass.Behavior, id, new JSONObject(behaviour).toString() );
            return ResponseEntity.ok(doc);

        } catch (Exception e) {
            // TODO: log.error
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }
    }

}
