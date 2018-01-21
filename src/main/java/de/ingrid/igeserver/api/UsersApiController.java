package de.ingrid.igeserver.api;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import de.ingrid.igeserver.model.User;
import de.ingrid.igeserver.model.User1;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class UsersApiController implements UsersApi {



    public ResponseEntity<Void> createUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User1 user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> deleteUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> get() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> getUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> list() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> updateUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
