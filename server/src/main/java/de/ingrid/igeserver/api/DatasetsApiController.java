package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.db.DBFindAllResults;
import de.ingrid.igeserver.db.FindOptions;
import de.ingrid.igeserver.db.QueryType;
import de.ingrid.igeserver.documenttypes.AddressWrapperType;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.model.Data1;
import de.ingrid.igeserver.model.SearchResult;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static de.ingrid.igeserver.db.OrientDBDatabase.DB_ID;
import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.TYPE;
import static de.ingrid.igeserver.services.MapperService.*;


@RestController
@RequestMapping(path = "/api")
public class DatasetsApiController implements DatasetsApi {

    private static final Logger log = LogManager.getLogger(DatasetsApiController.class);

    private enum CopyMoveOperation {COPY, MOVE}

    private final DBApi dbService;

    private final DocumentService documentService;

    private final DBUtils dbUtils;

    private final AuthUtils authUtils;

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
    public ResponseEntity<JsonNode> createDataset(
            Principal principal,
            String data,
            boolean address,
            Boolean publish) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            ObjectNode dataJson = (ObjectNode) getJsonNode(data);

            // add generated id to document (_id)
            // this one is different from the internal database id (@rid)
            UUID uuid = UUID.randomUUID();
            dataJson.put(FIELD_ID, uuid.toString());
            dataJson.put(FIELD_HAS_CHILDREN, false);
            String now = OffsetDateTime.now().toString();
            dataJson.put(FIELD_CREATED, now);
            dataJson.put(FIELD_MODIFIED, now);

            // get document type from document
            String documentType = dataJson.get(FIELD_DOCUMENT_TYPE).asText();

            JsonNode result = this.dbService.save(documentType, null, dataJson.toString());


            JsonNode nodeParentId = dataJson.get(PARENT_ID);
            String parentId = nodeParentId == null ? null : nodeParentId.textValue();

            // create DocumentWrapper
            ObjectNode documentWrapper = this.documentService.getDocumentWrapper();
            documentWrapper.put(FIELD_ID, uuid.toString());
            documentWrapper.put(FIELD_DRAFT, result.get(DB_ID).asText());
            documentWrapper.put(FIELD_PARENT, parentId);

            JsonNode resultWrapper = this.dbService.save(
                    address ? AddressWrapperType.TYPE : TYPE, null, documentWrapper.toString());

            ObjectNode resultDoc = this.documentService.getLatestDocument(resultWrapper);
            return ResponseEntity.ok(resultDoc);
        } catch (Exception e) {
            log.error("Error during creation of document", e);
            throw new ApiException(e.getMessage());
        }

    }

    /**
     * Update dataset.
     */
    public ResponseEntity<JsonNode> updateDataset(
            Principal principal, String id,
            String data,
            boolean publish,
            boolean revert, boolean forAddress) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String type = forAddress ? AddressWrapperType.TYPE : TYPE;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            if (dbId == null) {
                throw new NotFoundException(HttpStatus.NOT_FOUND.value(), "The user does not seem to be assigned to any database.");
            }

            if (revert) {
                throw new ApiException("Not implemented");
                // prepareDocumentFromDB = this.jsonFromService.revertDocument( id );
                // return;
            }

            ObjectNode docWrapper = (ObjectNode) this.documentService.getByDocId(id, type, false);


            String recordId;
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
            ObjectNode updatedDocument = (ObjectNode) getJsonNode(data);
            updatedDocument.put(FIELD_MODIFIED, OffsetDateTime.now().toString());
            String docType = updatedDocument.get(FIELD_DOCUMENT_TYPE).asText();

            handleLinkedDocs(updatedDocument);

            JsonNode save = this.dbService.save(docType, recordId, updatedDocument.toString());
            String dbID = save.get(DB_ID).asText();

            if (publish) {
                handlePublishingOnWrapper(type, docWrapper, dbID);
            } else {
                handleSaveOnWrapper(type, docWrapper, dbID);
            }

            JsonNode savedDoc = documentService.getByDocId(id, type, true);
            ObjectNode result = documentService.getLatestDocument(savedDoc);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error during updating of document", e);
            throw new ApiException(e.getMessage());
        }

    }

    private void handleLinkedDocs(ObjectNode doc) throws Exception {

        String docType = doc.get(FIELD_DOCUMENT_TYPE).asText();
        DocumentType refType = documentService.getDocumentType(docType);

        refType.handleLinkedFields(doc, dbService);

    }

    private void handleSaveOnWrapper(String type, ObjectNode docWrapper, String dbID) throws ApiException {
        // update document wrapper with new draft version
        if (docWrapper.get(FIELD_DRAFT).isNull()) {
            // TODO: db_id is ORecord!
            docWrapper.put(FIELD_DRAFT, dbID);
            this.dbService.save(type, docWrapper.get(DB_ID).asText(), docWrapper.toString());
        }
    }

    private void handlePublishingOnWrapper(String type, ObjectNode docWrapper, String dbID) throws ApiException {
        // add ID from published field to archive
        if (!docWrapper.get(FIELD_PUBLISHED).isNull()) {
            docWrapper.withArray(FIELD_ARCHIVE).add(docWrapper.get(FIELD_PUBLISHED));
        }

        // add doc to published reference
        docWrapper.put(FIELD_PUBLISHED, dbID);

        // remove draft version
        docWrapper.put(FIELD_DRAFT, (String) null);

        this.dbService.save(type, docWrapper.get(DB_ID).asText(), docWrapper.toString());
    }

    public ResponseEntity<String> deleteById(Principal principal, String[] ids, boolean forAddress) throws Exception {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String type = forAddress ? AddressWrapperType.TYPE : TYPE;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            for (String id : ids) {

                // TODO: remove references to document!?
                // TODO: remove all children recursively

                // String recordId = this.dbService.getRecordId(type, id);
                // JsonNode dbDoc = this.dbService.find(type, recordId);

                this.dbService.remove(type, id);

            }
            return ResponseEntity.ok().build();
        }
    }

    public ResponseEntity<Void> copyDatasets(
            Principal principal,
            List<String> ids,
            Data1 data) {

        try {

            copyOrMove(CopyMoveOperation.COPY, ids, data.getDestId());
            return new ResponseEntity<>(HttpStatus.OK);

        } catch (Exception ex) {
            log.error("Error during copy", ex);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Void> moveDatasets(
            Principal principal,
            List<String> ids,
            Data1 data) throws Exception {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            copyOrMove(CopyMoveOperation.MOVE, ids, data.getDestId());
            return new ResponseEntity<>(HttpStatus.OK);

        }
    }

    private void copyOrMove(CopyMoveOperation operation, List<String> ids, String destId) throws Exception {

        for (String id : ids) {
            JsonNode doc = this.dbService.find(TYPE, id);

            // add new parent to document
            ObjectNode updatedDoc = (ObjectNode) documentService.updateParent(DBUtils.toJsonString(doc), destId);

            if (operation == CopyMoveOperation.COPY) {
                // remove internal dataset Info (TODO: this should be done by the dbService)
                removeDBManagementFields(updatedDoc);

                // when we copy the node, then we also have to reset the id
                updatedDoc.set(MapperService.FIELD_ID, null);
            }

            // TODO: which ID?
            // null should be fine since a new document is created when copied
            // when moved however it should have the same ID!
            this.dbService.save("Documents", null, updatedDoc.toString());

        }
    }

    public ResponseEntity<List<ObjectNode>> getChildren(
            Principal principal,
            String parentId,
            boolean isAddress
    ) throws ApiException {

        DBFindAllResults docs;

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String type = isAddress ? AddressWrapperType.TYPE : TYPE;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {

            Map<String, String> queryMap = new HashMap<>();
            queryMap.put("_parent", parentId);
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = true;
            docs = this.dbService.findAll(type, queryMap, findOptions);

            List<ObjectNode> childDocs = docs.hits.stream()
                    .map(doc -> {
                        ObjectNode node = documentService.getLatestDocument(doc);
                        node.put(FIELD_HAS_CHILDREN, this.documentService.determineHasChildren(doc, type));
                        return node;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(childDocs);
        } catch (Exception e) {
            log.error(e);
            throw new ApiException("Error occured getting children: " + e.getMessage());
        }
    }

    public ResponseEntity<SearchResult> find(Principal principal, String query, int size, String sort, String sortOrder, boolean forAddress) throws Exception {

        DBFindAllResults docs;

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String type = forAddress ? AddressWrapperType.TYPE : TYPE;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            Map<String, String> queryMap = new HashMap<>();
            queryMap.put("draft.title", query);
            queryMap.put("draft IS NULL AND published.title", query);
            FindOptions findOptions = new FindOptions();
            findOptions.size = size;
            findOptions.queryType = QueryType.like;
            findOptions.sortField = sort;
            findOptions.sortOrder = sortOrder;
            findOptions.resolveReferences = true;

            docs = this.dbService.findAll(type, queryMap, findOptions);

            SearchResult searchResult = new SearchResult();
            searchResult.totalHits = docs.totalHits;

            searchResult.hits = docs.hits.stream()
                    .map(documentService::getLatestDocument)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(searchResult);

        }
    }

    public ResponseEntity<JsonNode> getByID(
            Principal principal,
            String id,
            Boolean publish, boolean address) throws Exception {

        String type = address ? AddressWrapperType.TYPE : TYPE;

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            Map<String, String> query = new HashMap<>();
            query.put("_id", id);
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = true;
            DBFindAllResults docs = this.dbService.findAll(type, query, findOptions);

            if (docs.totalHits > 0) {
                ObjectNode doc = documentService.getLatestDocument(docs.hits.get(0));

                return ResponseEntity.ok(doc);
            } else {
                throw new NotFoundException(404, "Document not found with id: " + id);
            }
        }


    }

    public ResponseEntity<List<String>> getPath(
            Principal principal,
            String id,
            boolean forAddress) throws ApiException {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String type = forAddress ? AddressWrapperType.TYPE : TYPE;

        String destId = id;
        List<String> path = new ArrayList<>();
        path.add(id);

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            while (destId != null) {
                JsonNode doc = this.documentService.getByDocId(destId, type, false);
                destId = doc.get("_parent").textValue();
                path.add(destId);
            }
        } catch (Exception e) {
            log.error(e);
        }
        // remove last element which is null
        path.remove(path.size() - 1);

        // turn path around
        Collections.reverse(path);

        return ResponseEntity.ok(path);
    }

}
