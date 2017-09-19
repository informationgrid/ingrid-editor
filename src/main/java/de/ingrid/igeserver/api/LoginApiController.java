package de.ingrid.igeserver.api;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestPart;

import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class LoginApiController implements LoginApi {



    public ResponseEntity<Void> login(@ApiParam(value = "") @RequestPart(value="username", required=false)  String username,
        @ApiParam(value = "") @RequestPart(value="password", required=false)  String password) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
