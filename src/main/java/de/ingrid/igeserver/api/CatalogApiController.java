package de.ingrid.igeserver.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import de.ingrid.igeserver.OrientDbService;
import io.swagger.annotations.ApiParam;

@Controller
public class CatalogApiController implements CatalogApi {
    
    @Autowired
    private OrientDbService dbService;

    @Override
    public ResponseEntity<String> getCatalogs() {
        // TODO Auto-generated method stub
        return null;
    }
    
    @Override
    public ResponseEntity<String> createCatalog(@ApiParam(value = "The name of the catalog to create.", required = true) @PathVariable("name") String name) {
        this.dbService.createDatabase( name );
        return null;
    }

    @Override
    public void testFunction(BehavioursApi behInterface) {
        // TODO Auto-generated method stub
        
    }

}
