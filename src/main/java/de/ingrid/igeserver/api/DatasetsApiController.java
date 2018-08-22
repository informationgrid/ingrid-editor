package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.sequence.OSequence;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.model.Data1;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.services.ExportService;
import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import io.swagger.annotations.ApiParam;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class DatasetsApiController implements DatasetsApi {

    private static Logger log = LogManager.getLogger(DatasetsApiController.class);

    private static final String COLLECTION = "Documents";

    private enum CopyMoveOperation {COPY, MOVE};

    @Autowired
    private DBApi dbService;

//    @Autowired
//    private JsonToDBService jsonFromService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private ExportService exportService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    /**
     * Create dataset.
     */
    public ResponseEntity<String> createDataset(
            Principal principal,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", defaultValue = "false", required = false) Boolean publish) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            Map mapDocument = this.documentService.mapDocumentToDatabase(data, publish, userId);

            // TODO: start transaction
            // Object transaction = this.dbService.beginTransaction();

            // add generated id to document (_id)
            // this one is different from the internal database id (@rid)
            // TODO: refactor getting sequence
            OSequence sequence = session.getMetadata().getSequenceLibrary().getSequence( "idseq" );
            mapDocument.put( "_id", String.valueOf(sequence.next()) );

            // db action
            Map result = this.dbService.save(DBApi.DBClass.Documents, null, mapDocument);

            // TODO: commit transaction
            // this.dbService.commit(transaction);
            Map docResult = this.documentService.mapDocumentFromDatabase(result);

            return ResponseEntity.ok(dbUtils.toJsonString(docResult));
        } catch (Exception e) {
            log.error("Error during creation of document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }

    }

    /**
     * Update dataset.
     */
    public ResponseEntity<String> updateDataset(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", defaultValue = "false", required = false) Boolean publish,
            @ApiParam(value = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", defaultValue = "false", required = false) Boolean revert) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            Map mapDocument = null;

            if (dbId == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user does not seem to be assigned to any database.");
            }

            if (revert) {
                // mapDocumentFromDatabase = this.jsonFromService.revertDocument( id );
            } else {
                mapDocument = this.documentService.mapDocumentToDatabase(data, publish, userId);
            }

            Map result = this.dbService.save(DBApi.DBClass.Documents, "IGNORE???", mapDocument);

            Map docResult = this.documentService.mapDocumentFromDatabase(result);

            return ResponseEntity.ok(dbUtils.toJsonString(docResult));

        } catch (Exception e) {
            log.error("Error during updating of document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }

    }

    public ResponseEntity<String> deleteById(Principal principal, @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String[] ids) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            for (String id: ids) {
                this.dbService.remove(DBApi.DBClass.Documents, id);
            }
            return ResponseEntity.ok().build();
        }
    }

    public ResponseEntity<Void> copyDatasets(
            Principal principal,
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data) {

        try {

            copyOrMove(CopyMoveOperation.COPY, ids, data.getDestId());
            return new ResponseEntity<Void>(HttpStatus.OK);

        } catch (Exception ex) {
            log.error("Error during copy", ex);
            return new ResponseEntity<Void>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Void> moveDatasets(Principal principal, @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
                                             @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data) throws Exception {
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {

            copyOrMove(CopyMoveOperation.MOVE, ids, data.getDestId());
            return new ResponseEntity<Void>(HttpStatus.OK);

        }
    }

    private void copyOrMove(CopyMoveOperation operation, List<String> ids, String destId) throws Exception {
        for (String id: ids) {
            Map doc = this.dbService.find(DBApi.DBClass.Documents, id);

            // add new parent to document
            ObjectNode updatedDoc = (ObjectNode) documentService.updateParent(dbUtils.toJsonString(doc), destId);

            if (operation == CopyMoveOperation.COPY) {
                // remove internal dataset Info (TODO: this should be done by the dbService)
                documentService.removeDBManagementFields(updatedDoc);

                // when we copy the node, then we also have to reset the id
                updatedDoc.set(MapperService.FIELD_ID, null);
            }

            // TODO: which ID?
            // null should be fine since a new document is created when copied
            // when moved however it should have the same ID!
            this.dbService.save(DBApi.DBClass.Documents, null, dbUtils.getMapFromObject(updatedDoc));

        }
    }

    public ResponseEntity<String> exportDataset(
            Principal principal,
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("id") String id,
            @ApiParam(value = "e.g. ISO", required = true) @PathVariable("format") String format) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        // TODO: refactor
        try (ODatabaseSession session = dbService.acquire(dbId)) {
            Map doc = this.dbService.find(DBApi.DBClass.Documents, id);

            JsonNode data = null;
            //data = this.documentService.mapDocumentFromDatabase( doc );

            // export doc
            String exportedDoc = (String) exportService.doExport(data, format);

            return ResponseEntity.ok(exportedDoc);
        }
    }

    public ResponseEntity<String> find(
            Principal principal,
            @NotNull @ApiParam(value = "", required = true) @RequestParam(value = "fields", required = true) String[] fields,
            @ApiParam(value = "Find datasets by a search query.") @RequestParam(value = "query", required = false) String query,
            @ApiParam(value = "Get all children of a dataset. The parameter 'parentId' is also needed for this request.") @RequestParam(value = "children", defaultValue = "false", required = false) Boolean children,
            @ApiParam(value = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.") @RequestParam(value = "parentId", required = false) String parentId,
            @ApiParam(value = "Sort by a given field.") @RequestParam(value = "sort", required = false) String sort,
            @ApiParam(value = "Reverse sort.") @RequestParam(value = "reverse", required = false) String reverse) throws Exception {

        List<Map> docs = null;
        List<String> mappedDocs = new ArrayList<>();

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            if (children) {
                Map<String, String> queryMap = new HashMap<>();
                docs = this.dbService.findAll(DBApi.DBClass.Documents, queryMap, false);
            } else {
                Map<String, String> queryMap = new HashMap<>();
                for (String field: fields) {
                    queryMap.put(field, query);
                }
                docs = this.dbService.findAll(DBApi.DBClass.Documents, queryMap, false); // fields );
            }

            for (Map doc: docs) {
                mappedDocs.add(this.dbUtils.toJsonString(this.documentService.mapDocumentFromDatabase(doc, fields)));
            }

            return ResponseEntity.ok("[" + String.join(",", mappedDocs) + "]");

        }
    }

    public ResponseEntity<String> getByID(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) throws Exception {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            Map<String, String> query = new HashMap<>();
            query.put("_id", id);
            List<Map> docs = this.dbService.findAll(DBApi.DBClass.Documents, query, true);

            if (docs.size() > 0) {
                Map doc = docs.get(0);
                log.debug("Getting dataset: " + id);

                if (doc == null) {
                    throw new ApiException(500, "No document found with the ID: " + id);
                    // return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No document with the ID: " + id);
                }

                Map mapDoc = null;

                // TODO: is this needed since it's not used anyway?
                doc.remove("@rid");
                doc.remove("@class");


                mapDoc = this.documentService.mapDocumentFromDatabase(doc);

                String[] refDocs = dbUtils.getReferencedDocs(mapDoc);
                documentService.addReferencedDocsTo(refDocs, mapDoc);

                return ResponseEntity.ok(documentService.toJsonString(mapDoc));
            } else {
                throw new ApiException("Document not found with id: " + id);
            }
        }

    }

    public ResponseEntity<List<String>> getPath(Principal principal, @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id) throws ApiException {

        //List<String> result = this.dbService.getPathToDataset( id );
        //return ResponseEntity.ok( result );
        String destId = id;
        List<String> path = new ArrayList<>();
        path.add(id);

        while (destId != null) {
            Map doc = this.documentService.getByDocId(destId);
            destId = (String) doc.get("_id");
            path.add(destId);
        }

        // remove last element which is null

        // turn path around



        throw new ApiException(500, "getPath not yet supported");
    }

}
