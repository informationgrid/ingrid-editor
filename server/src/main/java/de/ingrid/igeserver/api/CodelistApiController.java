package de.ingrid.igeserver.api;

import de.ingrid.codelists.model.CodeList;
import de.ingrid.igeserver.services.CodelistHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/codelist")
public class CodelistApiController implements CodelistApi {

    @Autowired
    CodelistHandler handler;

    @Override
    public ResponseEntity<List<CodeList>> getCodelistsByIds(List<String> ids) {

        List<CodeList> codelists = this.handler.getCodelists(ids);
        return ResponseEntity.ok(codelists);

    }

    @Override
    public ResponseEntity<List<CodeList>> getAllCodelists() throws ApiException {

        List<CodeList> codelists = this.handler.getAllCodelists();
        return ResponseEntity.ok(codelists);

    }

    @Override
    public ResponseEntity<List<CodeList>> updateCodelists() throws ApiException {

        List<CodeList> codelists = this.handler.fetchCodelists();

        if (codelists == null) {
            throw new ApiException("Codelists could not be synchronized");
        }

        return ResponseEntity.ok(codelists);

    }

}
