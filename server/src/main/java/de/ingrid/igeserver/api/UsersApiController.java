package de.ingrid.igeserver.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.*;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.model.User;
import de.ingrid.igeserver.model.User1;
import de.ingrid.igeserver.model.UserInfo;
import de.ingrid.igeserver.services.UserManagementService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import javax.naming.NoPermissionException;
import java.io.IOException;
import java.security.Principal;
import java.util.*;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")


@Controller
public class UsersApiController implements UsersApi {

    private static Logger log = LogManager.getLogger(UsersApiController.class);

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private DBApi dbService;

    @Autowired
    private UserManagementService keycloakService;

    @Autowired
    private AuthUtils authUtils;

    @Value("#{'${spring.profiles.active:}'.indexOf('dev') != -1}")
    private boolean developmentMode;

    public ResponseEntity<Void> createUser(String id, User1 user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> deleteUser(String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> get() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<User> getUser(Principal principal, String id) throws IOException {
        User user = keycloakService.getUser(principal, id);

        return ResponseEntity.ok(user);
    }

    public ResponseEntity<List<User>> list(Principal principal, AccessTokenResponse res) throws IOException, NoPermissionException {

        if (principal == null && !developmentMode) {
            log.warn("No principal found in request!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<User> users = keycloakService.getUsers(principal);

        if (users == null) {
            return ResponseEntity.status(500).body(null);
        } else {
            return ResponseEntity.ok(users);
        }
    }

    public ResponseEntity<Void> updateUser(String id, User user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    public ResponseEntity<UserInfo> currentUserInfo(Principal principal) throws ApiException {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        Set<String> dbIds = this.dbUtils.getCatalogsForUser(userId);
        Set<String> dbIdsValid = new HashSet<>();

        List<Catalog> assignedCatalogs = new ArrayList<>();

        for (String dbId : dbIds) {
            if (dbId != null) {
                Catalog catalogById = this.dbUtils.getCatalogById(dbId);
                if (catalogById != null) {
                    assignedCatalogs.add(catalogById);
                    dbIdsValid.add(dbId);
                }
            }
        }

        // clean up catalog association if one was deleted?
        if (dbIds.size() != assignedCatalogs.size()) {
            this.dbUtils.setCatalogIdsForUser(userId, dbIdsValid);
        }

        UserInfo userInfo = new UserInfo();
        userInfo.userId = userId;
        userInfo.assignedCatalogs = assignedCatalogs;
        userInfo.name = keycloakService.getName((KeycloakAuthenticationToken) principal);
        userInfo.roles = keycloakService.getRoles((KeycloakAuthenticationToken) principal);
        String currentCatalogForUser = this.dbUtils.getCurrentCatalogForUser(userId);
        Catalog catalog = this.dbUtils.getCatalogById(currentCatalogForUser);
        userInfo.currentCatalog = catalog;

        return ResponseEntity.ok(userInfo);
    }

    @Override
    public ResponseEntity<UserInfo> setCatalogAdmin(
            Principal principal,
            Map info) throws ApiException {

        try (ODatabaseSession session = dbService.acquire("IgeUsers")) {

            log.info("Parameter:", info);
            List<String> userIds = (List<String>) info.get("userIds");
            String catalogName = (String) info.get("catalogName");

            if (userIds == null || userIds.size() == 0) {
                throw new ApiException(500, "No user ids set to use as a catalog administrator");
            }
            // get catalog Info
            String userId = userIds.get(0);
            Map<String, String> query = new HashMap<>();
            query.put("userId", userId);
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = false;
            DBFindAllResults list = this.dbService.findAll("Info", query, findOptions);
            boolean isNewEntry = list.totalHits == 0;

            ObjectMapper objectMapper = new ObjectMapper();
            Set<String> catalogIds = new HashSet<>();
            ObjectNode catInfo;

            if (isNewEntry) {
                catInfo = objectMapper.createObjectNode();
                catInfo.put("userId", userId);
                catInfo.put("catalogIds", objectMapper.createArrayNode());
            } else {

                catInfo = (ObjectNode) list.hits.get(0);
                // make list to hashset
                catInfo.put("catalogIds", catInfo.get("catalogIds"));
            }

            ArrayNode catalogIdsArray = (ArrayNode) catInfo.get("catalogIds");

            for (Iterator<JsonNode> it = catalogIdsArray.iterator(); it.hasNext(); ) {
                catalogIds.add(it.next().asText());
            }

            // update catadmin in catalog Info
            if (catalogName != null) catalogIds.add(catalogName);

            catInfo.put("catalogIds", objectMapper.createArrayNode().addPOJO(catalogIds));

            String recordId = null;
            if (!isNewEntry) {
                recordId = catInfo.get("@rid").asText();
            }
            dbService.save(DBApi.DBClass.Info.name(), recordId, catInfo.toString());
        } catch (JsonProcessingException e) {
            log.error("Error processing JSON", e);
            throw new ApiException(e.getMessage());
        } catch (Exception e) {
            log.error(e);
        }

        return null;
    }

    @Override
    public ResponseEntity<List<String>> assignedUsers(Principal principal, String id) throws ApiException {
        List<String> result = new ArrayList<>();

        try (ODatabaseSession session = dbService.acquire("IgeUsers")) {
            Map<String, String> query = new HashMap<>();
            query.put("catalogIds", id);
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.contains;
            findOptions.resolveReferences = false;
            DBFindAllResults infos = this.dbService.findAll("Info", query, findOptions);
            for (JsonNode entry : infos.hits) {
                result.add(entry.get("userId").asText());
            }

        } catch (Exception e) {
            log.error("Could not get assigned Users", e);
        }

        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Void> switchCatalog(Principal principal, String catalogId) throws ApiException {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);

        try (ODatabaseSession session = dbService.acquire("IgeUsers")) {
            Map<String, String> query = new HashMap<>();
            query.put("userId", userId);
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = false;
            DBFindAllResults info = dbService.findAll("Info", query, findOptions);
            if (info.totalHits != 1) {
                String message = "User is not defined or more than once in IgeUsers-table: " + info.totalHits;
                log.error(message);
                throw new ApiException(message);
            }

            ObjectNode map = (ObjectNode) info.hits.get(0);
            map.put("currentCatalogId", catalogId);
            this.dbService.save("Info", map.get(OrientDBDatabase.DB_ID).asText(), map.toString());
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
