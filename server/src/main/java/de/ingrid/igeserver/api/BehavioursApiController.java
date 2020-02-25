package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class BehavioursApiController implements BehavioursApi {

    private static Logger log = LogManager.getLogger(BehavioursApiController.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    public ResponseEntity<ArrayNode> getBehaviours(Principal principal) throws ApiException {
        System.out.println(principal == null ? "principal is null" : "principal is " + principal.getName());

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            /*List<Map> behaviours = this.dbService.findAll(DBApi.DBClass.Behaviours);

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
                    .collect(Collectors.toList());*/

            return ResponseEntity.ok(new ObjectMapper().createArrayNode());
        }
    }

    public ResponseEntity<JsonNode> setBehaviours(
            Principal principal,
            String behavior) throws Exception {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            // TODO: get correct rid from database table
            // query by _id==""
            /*String id = "???";

            Map<String, Object> mappedBehavior = dbUtils.getMapFromObject(behavior);

            String rid = this.dbService.getRecordId("Behaviours", (String) mappedBehavior.get("_id"));
            if (rid != null) {
                mappedBehavior.put("@rid", rid);
            }

            Map doc = this.dbService.save("Behaviours", rid, mappedBehavior);
            Map docResult = this.documentService.prepareDocumentFromDB(doc, null);*/

            return ResponseEntity.ok(new ObjectMapper().createObjectNode());

        }
    }

}
