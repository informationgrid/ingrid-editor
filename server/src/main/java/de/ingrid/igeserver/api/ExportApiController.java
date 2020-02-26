package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.Data5;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api")
public class ExportApiController implements ExportApi {

    public ResponseEntity<Void> exportDataset2(Data5 data) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
