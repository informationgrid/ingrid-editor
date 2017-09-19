package de.ingrid.igeserver.api;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import de.ingrid.igeserver.model.Role;
import de.ingrid.igeserver.model.Role1;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class RolesApiController implements RolesApi {



    public ResponseEntity<Void> createRole(@ApiParam(value = "The unique id of the user.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the role into the database." ,required=true )  @Valid @RequestBody Role1 role) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> deleteRole(@ApiParam(value = "The unique id of the role.",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<String> getRole(@ApiParam(value = "The unique id of the role.",required=true ) @PathVariable("id") String id) {
        return ResponseEntity.ok("{ \"id\": -1 }");
    }

    public ResponseEntity<Void> getRoleOp(@ApiParam(value = "",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> getRolesOp() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<String> listRoles() {
        return ResponseEntity.ok("[]");
    }

    public ResponseEntity<Void> updateRole(@ApiParam(value = "The unique id of the role.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the role into the database." ,required=true )  @Valid @RequestBody Role role) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
