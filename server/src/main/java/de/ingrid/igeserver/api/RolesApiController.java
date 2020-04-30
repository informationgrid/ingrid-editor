package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.Role;
import de.ingrid.igeserver.model.Role1;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api")
public class RolesApiController implements RolesApi {


    public ResponseEntity<Void> createRole(String id, Role1 role) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> deleteRole(String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<String> getRole(String id) {
        return ResponseEntity.ok("{ \"id\": -1 }");
    }

    public ResponseEntity<String> listRoles() {
        return ResponseEntity.ok("[]");
    }

    public ResponseEntity<Void> updateRole(String id, Role role) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
