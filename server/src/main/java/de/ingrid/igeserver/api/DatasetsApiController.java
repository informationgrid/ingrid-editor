package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.db.QueryType;
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
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static de.ingrid.igeserver.db.OrientDBDatabase.DB_ID;
import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.DOCUMENT_WRAPPER;
import static de.ingrid.igeserver.services.MapperService.*;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class DatasetsApiController implements DatasetsApi {

    private static Logger log = LogManager.getLogger(DatasetsApiController.class);

    private static final String COLLECTION = "Documents";

    private enum CopyMoveOperation {COPY, MOVE}

    ;

    private DBApi dbService;

//    @Autowired
//    private JsonToDBService jsonFromService;

    private DocumentService documentService;

    @Autowired
    private ExportService exportService;

    private DBUtils dbUtils;

    private AuthUtils authUtils;

    @Autowired
    public DatasetsApiController(AuthUtils authUtils, DBUtils dbUtils, DBApi dbService, DocumentService documentService) {
        this.authUtils = authUtils;
        this.dbUtils = dbUtils;
        this.dbService = dbService;
        this.documentService = documentService;
    }

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


            // TODO: creating a new document inside DB
            // add document to correct document type class in database
            /*String documentType = doc.get(FIELD_PROFILE);
            String documentClass = this.dbService.getClassByDocumentType(documentType);
            Map result = this.dbService.save(documentClass, null, mapDocument);*/


            // add a new document wrapper which stores the document ID in the draft or
            // published field


            // if parentId exists then update hasChildren info even if it already has the value
            // which makes logic simpler


            //Map mapDocument = new HashMap(); //this.documentService.mapDocumentToDatabase(data, publish, userId);
            ObjectNode dataJson = (ObjectNode) getJsonMap(data);

            // add generated id to document (_id)
            // this one is different from the internal database id (@rid)
            // TODO: refactor getting sequence
            //OSequence sequence = session.getMetadata().getSequenceLibrary().getSequence("idseq");
            //mapDocument.put(FIELD_ID, String.valueOf(sequence.next()));
            UUID uuid = UUID.randomUUID();
            dataJson.put(FIELD_ID, uuid.toString());
            dataJson.put(FIELD_HAS_CHILDREN, false);
            String now = OffsetDateTime.now().toString();
            dataJson.put(FIELD_CREATED, now);
            dataJson.put(FIELD_MODIFIED, now);

            // get document type from document
            String documentType = dataJson.get(FIELD_PROFILE).asText();

            // get

            // db action
            // String jsonMapped = DBUtils.toJsonString(mapDocument);
//            Map result = this.dbService.save(documentType, null, mapDocument);
            Map result = this.dbService.save(documentType, null, dataJson.toString());


            String parentId = dataJson.get(PARENT_ID).textValue();

            // create DocumentWrapper
            ObjectNode documentWrapper = this.documentService.getDocumentWrapper();
            documentWrapper.put(FIELD_ID, uuid.toString());
            documentWrapper.put(FIELD_DRAFT, result.get(DB_ID).toString());
            documentWrapper.put(FIELD_PARENT, parentId);

            Map resultWrapper = this.dbService.save(DOCUMENT_WRAPPER, null, documentWrapper.toString());

            // update parent that it has children if needed
            if (parentId != null) {
                JsonNode parentDoc = this.documentService.getByDocId(parentId);
                ObjectNode parentDocVersion = (ObjectNode) this.getLatestDocument(parentDoc);
                if (!parentDocVersion.get(FIELD_HAS_CHILDREN).asBoolean()) {
                    parentDocVersion.put(FIELD_HAS_CHILDREN, true);
                    this.dbService.save(
                            parentDocVersion.get(FIELD_PROFILE).asText(),
                            parentDocVersion.get(DB_ID).asText(),
                            parentDocVersion.toString()
                    );
                }
            }

            Map docResult = this.documentService.prepareDocumentFromDB(result, documentWrapper);

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
            ObjectNode mapDocument = (ObjectNode) getJsonMap(data);
            mapDocument.put(FIELD_MODIFIED, OffsetDateTime.now().toString());

            String docType = mapDocument.get(FIELD_PROFILE).asText();

            if (dbId == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The user does not seem to be assigned to any database.");
            }

            if (revert) {
                // prepareDocumentFromDB = this.jsonFromService.revertDocument( id );
                throw new NotImplementedException();
            } else {
                // mapDocument = this.documentService.mapDocumentToDatabase(data, publish, userId);
            }

            String recordId = null;


            Map<String, String> query = new HashMap<>();
            query.put("_id", id);
            List<String> docWrappers = dbService.findAll(DOCUMENT_WRAPPER, query, QueryType.exact, false);
            if (docWrappers.size() != 1) {
                log.error("A Document_Wrapper could not be found or is not unique for UUID: " + id + " (got " + docWrappers.size() + ")");
                throw new RuntimeException("No unique document wrapper found");
            }
            ObjectNode docWrapper = (ObjectNode) getJsonMap(docWrappers.get(0));
            Map result;


            // just update document by using new data and adding database ID
            if (docWrapper.get(FIELD_DRAFT).isNull()) {
                // create copy of published document with a new db-id
//                    ObjectNode published = (ObjectNode) docWrapper.get(FIELD_PUBLISHED);
//                    published.remove(DB_ID);
//                    Map newDraft = this.dbService.save(docType, null, published);
                recordId = null; // (String) newDraft.get(DB_ID);
            } else {
                recordId = docWrapper.get(FIELD_DRAFT).asText();
            }

            // save document with same ID or new one, if no draft version exists
            result = this.dbService.save(docType, recordId, mapDocument.toString());

            if (publish) {
                // add ID from published field to archive
                if (!docWrapper.get(FIELD_PUBLISHED).isNull()) {
                    docWrapper.withArray(FIELD_ARCHIVE).add(docWrapper.get(FIELD_PUBLISHED));
                }

                // add doc to published reference
                docWrapper.put(FIELD_PUBLISHED, result.get(DB_ID).toString());

                // remove draft version
                docWrapper.put(FIELD_DRAFT, (String) null);

                this.dbService.save(DOCUMENT_WRAPPER, docWrapper.get(DB_ID).asText(), docWrapper.toString());

                //throw new NotImplementedException();
            } else {

                // update document wrapper with new draft version
                if (docWrapper.get(FIELD_DRAFT).isNull()) {
                    // TODO: db_id is ORecord!
                    docWrapper.put(FIELD_DRAFT, result.get(DB_ID).toString());
                    this.dbService.save(DOCUMENT_WRAPPER, docWrapper.get(DB_ID).asText(), docWrapper.toString());
                }
            }


            Map docResult = this.documentService.prepareDocumentFromDB(result, docWrapper);

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
            for (String id : ids) {
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
        for (String id : ids) {
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
            this.dbService.save("Documents", null, updatedDoc.toString());

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
            //data = this.documentService.prepareDocumentFromDB( doc );

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

        List<String> docs = null;
        List<String> mappedDocs = new ArrayList<>();

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            if (children) {
                Map<String, String> queryMap = new HashMap<>();
                queryMap.put("_parent", parentId);
                docs = this.dbService.findAll(DOCUMENT_WRAPPER, queryMap, QueryType.like, true);
            } else {
                Map<String, String> queryMap = new HashMap<>();
                for (String field : fields) {
                    queryMap.put(field, query);
                }
                docs = this.dbService.findAll(DOCUMENT_WRAPPER, queryMap, QueryType.like, true); // fields );
            }

            String childDocs = docs.stream()
                    .map(doc -> {
                        try {
                            return getJsonMap(doc);
                        } catch (Exception e) {
                            log.error(e);
                            return null;
                        }
                    })
                    .map(doc -> {
                        ObjectNode node = (ObjectNode) getLatestDocument(doc);
                        node.put(FIELD_STATE, this.documentService.determineState(doc));
                        return node;
                    })
                    .map(doc -> {
                        try {
                            doc.retain(fields);
                            return doc.toString();
                        } catch (Exception e) {
                            log.error(e);
                            return null;
                        }
                    })
                    .collect(Collectors.joining(","));

            /*for (String doc : docs) {
                mappedDocs.add(this.dbUtils.toJsonString(this.documentService.prepareDocumentFromDB(doc, null, fields)));
            }*/

            return ResponseEntity.ok("[" + childDocs + "]");

        }
    }

    private JsonNode getLatestDocument(JsonNode doc) {
        JsonNode draft = doc.get(FIELD_DRAFT);
        if (draft.isNull()) {
            return doc.get(FIELD_PUBLISHED);
        } else {
            return draft;
        }
    }

    public ResponseEntity<String> getByID(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) throws Exception {

        long start = System.currentTimeMillis();
        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            Map<String, String> query = new HashMap<>();
            query.put("_id", id);
            List<String> docs = this.dbService.findAll(DOCUMENT_WRAPPER, query, QueryType.exact, true);

            if (docs.size() > 0) {
                Map doc = getMapFromObject(docs.get(0));
                log.debug("Getting dataset: " + id);

                if (doc == null) {
                    throw new ApiException(500, "No document found with the ID: " + id);
                    // return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No document with the ID: " + id);
                }

                Map mapDoc = null;
                Object theDocument = doc.get(FIELD_DRAFT);
                if (theDocument == null) {
                    theDocument = doc.get(FIELD_PUBLISHED);
                }

                // TODO: is this needed since it's not used anyway?
                //doc.remove("@rid");
                //doc.remove("@class");


                mapDoc = this.documentService.prepareDocumentFromDB((Map) theDocument, doc);

                //String[] refDocs = dbUtils.getReferencedDocs(mapDoc);
                //documentService.addReferencedDocsTo(refDocs, mapDoc);

                long end = System.currentTimeMillis();
                String body = documentService.toJsonString(mapDoc);
                log.debug("getById took: " + (end - start) + "ms");
                return ResponseEntity.ok(body);
            } else {
                throw new ApiException("Document not found with id: " + id);
            }
        }


    }

    public ResponseEntity<List<String>> getPath(Principal principal, @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        //List<String> result = this.dbService.getPathToDataset( id );
        //return ResponseEntity.ok( result );
        String destId = id;
        List<String> path = new ArrayList<>();
        path.add(id);

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            while (destId != null) {
                JsonNode doc = this.documentService.getByDocId(destId);
                destId = doc.get("_parent").textValue();
                path.add(destId);
            }
        }
        // remove last element which is null
        path.remove(path.size() - 1);

        // turn path around
        Collections.reverse(path);

        return ResponseEntity.ok(path);
    }

}
