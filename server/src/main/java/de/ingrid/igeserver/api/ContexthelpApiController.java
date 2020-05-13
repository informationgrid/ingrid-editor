package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.Role;
import de.ingrid.igeserver.model.Role1;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api")
public class ContexthelpApiController implements ContexthelpApi {

    public ResponseEntity<String> getContexthelptext(String id, String profile, String docType) {
        return ResponseEntity.ok("\"Testdescription aus Backend\"");
    }

    public ResponseEntity<String> listContexthelpIds(String profile, String docType) {
        return ResponseEntity.ok("[\"description\"]");
    }
}
