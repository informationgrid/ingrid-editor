package de.ingrid.igeserver.api;

import de.ingrid.igeserver.db.DBApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import io.swagger.annotations.ApiParam;

@Controller
public class CatalogApiController implements CatalogApi {

    @Autowired
    private DBApi dbService;

    @Override
    public ResponseEntity<String[]> getCatalogs() {
        String[] databases = this.dbService.getDatabases();

        return ResponseEntity.ok().body(databases);
    }

    @Override
    public ResponseEntity<String> createCatalog(@ApiParam(value = "The name of the catalog to create.", required = true) @PathVariable("name") String name) throws ApiException {
        this.dbService.createDatabase(name);
        return null;
    }

    @Override
    public ResponseEntity<String> deleteCatalog(String name) throws ApiException {
        this.dbService.removeDatabase(name);
        return null;
    }

}
