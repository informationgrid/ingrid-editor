package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api")
public class BehavioursApiController implements BehavioursApi {

    private static Logger log = LogManager.getLogger(BehavioursApiController.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    public ResponseEntity<List<JsonNode>> getBehaviours(Principal principal) throws ApiException {
        System.out.println(principal == null ? "principal is null" : "principal is " + principal.getName());

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            List<JsonNode> behaviours = this.dbService.findAll(DBApi.DBClass.Behaviours.name());

            // String prepareBehaviour = jsonService.prepareBehaviour( behaviours.get( 0 ) );
            // TODO: map behaviours to JSON
            // List<JSONObject> collect = behaviours.stream().map(b -> new JSONObject(b)).collect(Collectors.toList());
            List<JsonNode> collect = behaviours.stream()
                    .map(b -> {
                        try {
                            MapperService.removeDBManagementFields((ObjectNode) b);
                            return b;
                        } catch (Exception e) {
                            log.error(e);
                            return null;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(collect);
        }
    }

    public ResponseEntity<JsonNode> setBehaviours(
            Principal principal,
            String behavior) throws Exception {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            ObjectNode mappedBehavior = (ObjectNode) MapperService.getJsonNode(behavior);

            String rid = this.dbService.getRecordId("Behaviours", mappedBehavior.get("_id").asText());
            if (rid != null) {
                mappedBehavior.put("@rid", rid);
            }

            JsonNode doc = this.dbService.save("Behaviours", rid, mappedBehavior.toString());
            MapperService.removeDBManagementFields((ObjectNode) doc);

            return ResponseEntity.ok(doc);

        }
    }

}
