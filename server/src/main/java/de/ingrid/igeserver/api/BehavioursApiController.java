package de.ingrid.igeserver.api;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import io.swagger.annotations.ApiParam;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import javax.validation.Valid;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class BehavioursApiController implements BehavioursApi {

    private static Logger log = LogManager.getLogger(BehavioursApiController.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    @Autowired
    private DocumentService documentService;

    //@Autowired
    //private JsonToDBService jsonService;

    public ResponseEntity<List<Map>> getBehaviours(Principal principal) throws ApiException {
        System.out.println(principal == null ? "principal is null" : "principal is " + principal.getName());

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            List<Map> behaviours = this.dbService.findAll(DBApi.DBClass.Behaviours);

            // String prepareBehaviour = jsonService.prepareBehaviour( behaviours.get( 0 ) );
            // TODO: map behaviours to JSON
            // List<JSONObject> collect = behaviours.stream().map(b -> new JSONObject(b)).collect(Collectors.toList());
            List<Map> collect = behaviours.stream()
                    .map(b -> {
                        try {
                            b.remove("@rid");
                            b.remove("@class");
                            return b;
                        } catch (Exception e) {
                            log.error(e);
                            return null;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(collect); //"[" + String.join( ",", behaviours ) + "]" );
        }
    }

    public ResponseEntity<String> setBehaviours(
            Principal principal,
            @ApiParam(value = "", required = true) @Valid @RequestBody String behavior) throws Exception {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            // TODO: get correct rid from database table
            // query by _id==""
            String id = "???";

            Map<String, Object> mappedBehavior = dbUtils.getMapFromObject(behavior);

            String rid = this.dbService.getRecordId("Behaviours", (String) mappedBehavior.get("_id"));
            if (rid != null) {
                mappedBehavior.put("@rid", rid);
            }

            Map doc = this.dbService.save("Behaviours", rid, mappedBehavior);
            Map docResult = this.documentService.prepareDocumentFromDB(doc, null);

            return ResponseEntity.ok(dbUtils.toJsonString(docResult));

        }
    }

}
