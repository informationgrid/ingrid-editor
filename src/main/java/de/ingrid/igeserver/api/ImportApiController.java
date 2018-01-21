package de.ingrid.igeserver.api;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import de.ingrid.igeserver.model.Data4;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class ImportApiController implements ImportApi {

    public ResponseEntity<Void> importDataset(@ApiParam(value = "The dataset to be imported." ,required=true )  @Valid @RequestBody Data4 data) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
