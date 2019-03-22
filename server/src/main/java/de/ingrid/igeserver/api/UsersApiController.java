package de.ingrid.igeserver.api;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.id.ORecordId;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.model.User;
import de.ingrid.igeserver.model.User1;
import de.ingrid.igeserver.model.UserInfo;
import de.ingrid.igeserver.services.UserManagementService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import io.swagger.annotations.ApiParam;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import javax.naming.NoPermissionException;
import javax.validation.Valid;
import java.io.IOException;
import java.security.Principal;
import java.util.*;

import static de.ingrid.igeserver.services.MapperService.getJsonMap;
import static de.ingrid.igeserver.services.MapperService.getMapFromJson;

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

    @Value("${development}")
    private boolean developmentMode;

    public ResponseEntity<Void> createUser(@ApiParam(value = "The unique login of the user.", required = true) @PathVariable("id") String id,
                                           @ApiParam(value = "Save the user data into the database.", required = true) @Valid @RequestBody User1 user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> deleteUser(@ApiParam(value = "The unique login of the user.", required = true) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> get() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<User> getUser(Principal principal, @ApiParam(value = "The unique login of the user.", required = true) @PathVariable("id") String id) throws IOException {
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

    public ResponseEntity<Void> updateUser(@ApiParam(value = "The unique login of the user.", required = true) @PathVariable("id") String id,
                                           @ApiParam(value = "Save the user data into the database.", required = true) @Valid @RequestBody User user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
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

        userInfo.roles = keycloakService.getRoles((KeycloakAuthenticationToken) principal);

        return ResponseEntity.ok(userInfo);
    }

    @Override
    public ResponseEntity<UserInfo> setCatalogAdmin(
            Principal principal,
            @ApiParam(value = "Save the user data into the database.", required = true) @Valid @RequestBody Map info) throws ApiException {

        try (ODatabaseSession session = dbService.acquire("IgeUsers")) {

            log.info("Parameter:", info);
            String userId = (String) info.get("userId");
            String catalogName = (String) info.get("catalogName");

            if (userId == null || userId.isEmpty()) {
                throw new ApiException(500, "The user id is not set to set as a catalog administrator");
            }
            // get catalog Info
            Map<String, String> query = new HashMap<>();
            query.put("userId", userId);
            List<String> list = this.dbService.findAll("Info", query, true);
            boolean isNewEntry = list.size() == 0;

            Set<String> catalogIds;
            Map catInfo;
            if (isNewEntry) {
                catInfo = new HashMap();
                catInfo.put("userId", userId);
                catInfo.put("catalogIds", new HashSet<String>());
            } else {

                catInfo = getMapFromJson(list.get(0));
            }
            catalogIds = (Set<String>) catInfo.get("catalogIds");

            // update catadmin in catalog Info
            if (catalogName != null) catalogIds.add(catalogName);

            catInfo.put("catalogIds", catalogIds);

            String recordId = null;
            if (!isNewEntry) {
                recordId = ((ORecordId) catInfo.get("@rid")).toString();
            }
            dbService.save(DBApi.DBClass.Info.name(), recordId, catInfo);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return null;
    }

}
