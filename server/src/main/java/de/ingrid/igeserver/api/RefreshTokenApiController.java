package de.ingrid.igeserver.api;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api")
public class RefreshTokenApiController implements RefreshTokenApi {

    public ResponseEntity<Void> refreshToken() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
