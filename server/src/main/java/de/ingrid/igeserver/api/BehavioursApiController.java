package de.ingrid.igeserver.api;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.annotations.ApiParam;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class BehavioursApiController implements BehavioursApi {

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    //@Autowired
    //private JsonToDBService jsonService;

    public ResponseEntity<List<JSONObject>> getBehaviours(Principal principal) throws ApiException {
        System.out.println(principal == null ? "principal is null" : "principal is " + principal.getName());

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            List<Map> behaviours = this.dbService.findAll(DBApi.DBClass.Behaviours);

            // String prepareBehaviour = jsonService.prepareBehaviour( behaviours.get( 0 ) );
            // TODO: map behaviours to JSON
            List<JSONObject> collect = behaviours.stream().map(b -> new JSONObject(b)).collect(Collectors.toList());

            return ResponseEntity.ok(collect); //"[" + String.join( ",", behaviours ) + "]" );
        }
    }

    public ResponseEntity<Map> setBehaviours(
            Principal principal,
            @ApiParam(value = "", required = true) @Valid @RequestBody String behavior) throws ApiException {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            // TODO: get correct rid from database table
            // query by _id==""
            String id = "???";

            Map<String, Object> mappedBehavior = dbUtils.getMapFromObject(behavior);
            Map<String, String> query = new HashMap<>();
            query.put("_id", (String) mappedBehavior.get("_id"));

            Object rid = this.dbService.getRecordId(DBApi.DBClass.Behaviours, query);
            mappedBehavior.put("@rid", rid);

            Map doc = this.dbService.save(DBApi.DBClass.Behaviours, id, mappedBehavior);
            return ResponseEntity.ok(doc);

        }
    }

}
