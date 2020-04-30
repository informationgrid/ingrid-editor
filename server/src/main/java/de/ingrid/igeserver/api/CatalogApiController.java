package de.ingrid.igeserver.api;

import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.utils.DBUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogApiController implements CatalogApi {

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Override
    public ResponseEntity<List<Catalog>> getCatalogs() {
        String[] databases = this.dbService.getDatabases();
        List<Catalog> catalogs = new ArrayList<>();

        for (String db : databases) {
            catalogs.add(this.dbUtils.getCatalogById(db));
        }

        return ResponseEntity.ok().body(catalogs);
    }

    @Override
    public ResponseEntity<String> createCatalog(Catalog settings) throws ApiException {
        String catalogId = this.dbService.createDatabase(settings);
        return ResponseEntity.ok().body("{ \"catalogId\": \"" + catalogId + "\"}");
    }

    @Override
    public ResponseEntity<Void> updateCatalog(String name, Catalog settings) throws ApiException {
        this.dbService.updateDatabase(settings);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> deleteCatalog(String name) {
        this.dbService.removeDatabase(name);
        return ResponseEntity.ok().build();
    }

}
