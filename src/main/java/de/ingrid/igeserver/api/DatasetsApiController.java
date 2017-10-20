package de.ingrid.igeserver.api;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import de.ingrid.igeserver.OrientDbService;
import de.ingrid.igeserver.model.Data1;
import de.ingrid.igeserver.services.DBToJsonService;
import de.ingrid.igeserver.services.ExportService;
import de.ingrid.igeserver.services.JsonToDBService;
import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.utils.DBUtils;
import io.swagger.annotations.ApiParam;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class DatasetsApiController implements DatasetsApi {

    private static final String COLLECTION = "Documents";
    
    private enum CopyMoveOperation { COPY, MOVE };
    
    @Autowired
    private OrientDbService dbService;

    @Autowired
    private JsonToDBService jsonFromService;

    @Autowired
    private DBToJsonService jsonToService;

    @Autowired
    private ExportService exportService;

    @Autowired
    private DBUtils dbUtils;

    /**
     * Create dataset.
     */
    public ResponseEntity<String> createDataset(
            @RequestHeader(value = "Authorization") String auth,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", defaultValue = "false", required = false) Boolean publish) {

        try {
            String userId = getUserIdFromHeader( auth );
            String mapDocument = this.jsonFromService.mapDocument( data, publish, userId );
            String result = this.dbService.addDocTo( COLLECTION, mapDocument );
            JsonNode mapDoc = this.jsonToService.mapDocument( result );

            return ResponseEntity.ok( jsonToService.toJsonString( mapDoc ) );
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }

    }

    /**
     * Update dataset.
     */
    public ResponseEntity<String> updateDataset(
            @RequestHeader(value = "Authorization") String auth,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", defaultValue = "false", required = false) Boolean publish,
            @ApiParam(value = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", defaultValue = "false", required = false) Boolean revert) {

        try {
            String mapDocument = null;
            String userId = getUserIdFromHeader( auth );
            String dbId = this.dbUtils.getCatalogForUser( userId );

            if (dbId == null) {
                return ResponseEntity.status( HttpStatus.NOT_FOUND ).body( "The user does not seem to be assigned to any database." );
            }

            if (revert) {
                mapDocument = this.jsonFromService.revertDocument( id );
            } else {
                mapDocument = this.jsonFromService.mapDocument( data, publish, userId );
            }

            String result = this.dbService.updateDocTo( dbId, COLLECTION, id, mapDocument );
            JsonNode mapDoc = this.jsonToService.mapDocument( result );
            return ResponseEntity.ok( jsonToService.toJsonString( mapDoc ) );

        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();

            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }

    }

    private String getUserIdFromHeader(String auth) {
        String userId = null;
        try {
            DecodedJWT jwt = JWT.decode( auth.replace( "Bearer", "" ) );
            userId = jwt.getClaim( "preferred_username" ).asString();
        } catch (JWTDecodeException exception) {
            // Invalid token
        }
        return userId;
    }

    public ResponseEntity<String> deleteById(@ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String[] ids) {

        try {
            for (String id : ids) {
                this.dbService.deleteDocFrom( "Documents", id );
            }
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( "One or more documents could not be deleted: " + ex.getMessage() );
        }
    }

    public ResponseEntity<Void> copyDatasets(
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data) {

        try {
            
            copyOrMove(CopyMoveOperation.COPY, ids, data.getDestId());
            return new ResponseEntity<Void>( HttpStatus.OK );

        } catch (Exception ex) {
            return new ResponseEntity<Void>( HttpStatus.INTERNAL_SERVER_ERROR );
        }
    }
    
    public ResponseEntity<Void> moveDatasets(@ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data) {
        try {
            
            copyOrMove(CopyMoveOperation.MOVE, ids, data.getDestId());
            return new ResponseEntity<Void>( HttpStatus.OK );

        } catch (Exception ex) {
            return new ResponseEntity<Void>( HttpStatus.INTERNAL_SERVER_ERROR );
        }
    }
    
    private void copyOrMove(CopyMoveOperation operation, List<String> ids, String destId) throws Exception {
        for (String id : ids) {
            String doc = this.dbService.getById( COLLECTION, id );

            // add new parent to document
            ObjectNode updatedDoc = (ObjectNode) jsonToService.updateParent( doc, destId );
            
            if (operation == CopyMoveOperation.COPY) {
                // remove internal dataset info (TODO: this should be done by the dbService)
                jsonToService.removeDBManagementFields( updatedDoc );
    
                // when we copy the node, then we also have to reset the id
                updatedDoc.set( MapperService.FIELD_ID, null );
            }

            this.dbService.addDocTo( COLLECTION, jsonToService.toJsonString( updatedDoc ) );

        }
    }

    public ResponseEntity<String> exportDataset(
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("id") String id,
            @ApiParam(value = "e.g. ISO", required = true) @PathVariable("format") String format) {

        // TODO: refactor
        String doc = this.dbService.getById( COLLECTION, id );

        JsonNode data = null;
        try {
            data = this.jsonToService.mapDocument( doc );
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        // export doc
        String exportedDoc = (String) exportService.doExport( data, format );

        return ResponseEntity.ok( exportedDoc );
    }

    public ResponseEntity<String> find(
            @NotNull @ApiParam(value = "", required = true) @RequestParam(value = "fields", required = true) String fields,
            @ApiParam(value = "Find datasets by a search query.") @RequestParam(value = "query", required = false) String query,
            @ApiParam(value = "Get all children of a dataset. The parameter 'parentId' is also needed for this request.") @RequestParam(value = "children", defaultValue = "false", required = false) Boolean children,
            @ApiParam(value = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.") @RequestParam(value = "parentId", required = false) String parentId,
            @ApiParam(value = "Sort by a given field.") @RequestParam(value = "sort", required = false) String sort,
            @ApiParam(value = "Reverse sort.") @RequestParam(value = "reverse", required = false) String reverse) {

        List<String> docs = null;
        List<String> mappedDocs = new ArrayList<>();

        try {
            if (children) {
                docs = this.dbService.getChildDocuments( parentId );
            } else {
                docs = this.dbService.find( "igedb", COLLECTION, null, null );
            }

            for (String doc : docs) {
                String[] splitFields = fields == null ? null : fields.split( "," );
                mappedDocs.add( jsonToService.toJsonString( this.jsonToService.mapDocument( doc, splitFields ) ) );
            }

            return ResponseEntity.ok( "[" + String.join( ",", mappedDocs ) + "]" );

        } catch (Exception e) {
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }

    }

    public ResponseEntity<String> getByID(
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) {

        String doc = this.dbService.getById( COLLECTION, id );

        if (doc == null) {
            return ResponseEntity.status( HttpStatus.NOT_FOUND ).body( "No document with the ID: " + id );
        }

        JsonNode mapDoc = null;
        try {
            mapDoc = this.jsonToService.mapDocument( doc );

            String[] refDocs = dbUtils.getReferencedDocs( mapDoc );
            jsonToService.addReferencedDocsTo( refDocs, (ObjectNode) mapDoc );

            return ResponseEntity.ok( jsonToService.toJsonString( mapDoc ) );
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }

    }

    public ResponseEntity<List<String>> getPath(@ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id) {

        List<String> result = this.dbService.getPathToDataset( id );
        return ResponseEntity.ok( result );
    }


    /**
     * OPTION - CALLS
     */

    public ResponseEntity<Void> getCopyOp(@ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids) {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

    public ResponseEntity<Void> getDatasetOp(
            @ApiParam(value = "", required = true) @PathVariable("id") String id,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

    public ResponseEntity<Void> getDatasetsOp() {
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

    public ResponseEntity<Void> getExportOp(@ApiParam(value = "", required = true) @PathVariable("id") String id,
            @ApiParam(value = "", required = true) @PathVariable("format") String format) {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

    public ResponseEntity<Void> getMoveOp(@ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids) {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }

    public ResponseEntity<Void> getPathOp(@ApiParam(value = "", required = true) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>( HttpStatus.OK );
    }
}
