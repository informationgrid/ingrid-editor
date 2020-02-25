package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.Data5;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class ExportApiController implements ExportApi {

    public ResponseEntity<Void> exportDataset2(Data5 data) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
