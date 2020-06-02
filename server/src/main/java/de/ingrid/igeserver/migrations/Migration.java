package de.ingrid.igeserver.migrations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.documenttypes.AbstractDocumentType;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.profiles.TestType;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.services.MapperService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;

import static de.ingrid.igeserver.db.OrientDBDatabase.DB_ID;
import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.TYPE;
import static de.ingrid.igeserver.services.MapperService.*;

@Service
public class Migration {

    private static final Logger log = LogManager.getLogger(Migration.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    List<AbstractDocumentType> documentTypes;

    private int migratedDocs = 0;

    @PostConstruct
    public void init() {

        update();

    }

    private void update() {

        String[] databases = this.dbService.getDatabases();

        for (String database : databases) {
            String version = getVersion(database);
            if (version.compareTo("0.1") < 0) {
                addTestDocClass(database);
                migrateProfileToDoctypes(database);
                migrateDocumentClasses(database);
                setVersion(database, "0.1");
            }
        }

    }

    private String getVersion(String database) {

        try (ODatabaseSession ignored = dbService.acquire(database)) {
            List<JsonNode> info = dbService.findAll("Info");
            JsonNode infoDoc = info.get(0);
            JsonNode version = infoDoc.get("version");
            return version == null ? "0" : version.asText();
        }

    }

    private void setVersion(String database, String version) {

        try (ODatabaseSession ignored = dbService.acquire(database)) {
            List<JsonNode> info = dbService.findAll("Info");
            JsonNode infoDoc = info.get(0);
            ((ObjectNode)infoDoc).put("version", version);

            dbService.save("Info", infoDoc.get(DB_ID).asText(), infoDoc.toString());
        } catch (ApiException e) {
            log.error(e);
        }

    }

    private void migrateDocumentClasses(String database) {

        this.addDocumentClass(database);

        try (ODatabaseSession ignored = dbService.acquire(database)) {

            documentTypes.forEach(type -> {

                if (type.getTypeName().equals("Document") || type.getTypeName().equals("DocumentWrapper")) {
                    return;
                }

                List<JsonNode> docs = dbService.findAll(type.getTypeName());
                if (docs != null && docs.size() > 0) {
                    for (JsonNode doc : docs) {
                        try {
                            handleDocumentClassesMigration(type, doc);
                        } catch (Exception e) {
                            log.error(e);
                        }
                    }
                }

                dbService.remove(type.getTypeName(), new HashMap<>());

            });

            dbService.remove("AddressWrapper", new HashMap<>());
            dbService.remove("OrganizationDoc", new HashMap<>());

            log.info("Migrated docs of: " + database + " => " + migratedDocs);

        }

    }

    private void migrateProfileToDoctypes(String database) {

        migratedDocs = 0;

        try (ODatabaseSession ignored = dbService.acquire(database)) {

            documentTypes.forEach(type -> {

                List<JsonNode> docs = dbService.findAll(type.getTypeName());
                if (docs != null && docs.size() > 0) {
                    for (JsonNode doc : docs) {
                        handleDoctypeMigration(type, doc);
                    }
                }

            });

            log.info("Migrated docs of: " + database + " => " + migratedDocs);

        }

    }

    public void handleDoctypeMigration(AbstractDocumentType type, JsonNode doc) {

        JsonNode doctype = doc.get("_profile");
        if (doctype != null && !doctype.asText().isEmpty()) {
            ((ObjectNode) doc).put(MapperService.FIELD_DOCUMENT_TYPE, doctype.asText());
            ((ObjectNode) doc).remove("_profile");
            String recordId = doc.get("@rid").asText();
            try {
                dbService.save(type.getTypeName(), recordId, doc.toString());
                migratedDocs++;
            } catch (ApiException e) {
                log.error("Error migrating document", e);
            }
        }

    }

    public void handleDocumentClassesMigration(AbstractDocumentType type, JsonNode doc) throws Exception {

        String recordId = doc.get("@rid").asText();
        String id = doc.get(FIELD_ID).asText();
        String docType = doc.get(FIELD_DOCUMENT_TYPE).asText();

        ObjectNode docWrapper;
        boolean isAddress = false;

        try {
            docWrapper = (ObjectNode) this.documentService.getByDocId(id, TYPE, false);
        } catch (Exception e) {
            try {
                docWrapper = (ObjectNode) this.documentService.getByDocId(id, "AddressWrapper", false);
                isAddress = true;
            } catch (Exception e2) {
                log.warn("No wrapper found. Deleting entry");
                this.dbService.remove(docType, id);
                return;
            }
        }

        String newRecordId;
        try {
            removeDBManagementFields((ObjectNode) doc);
            JsonNode result = dbService.save(DocumentType.TYPE, null, doc.toString());
            newRecordId = result.get(DB_ID).asText();
        } catch (ApiException e) {
            log.error("Error migrating document", e);
            return;
        }

        if (isAddress) {
            removeDBManagementFields(docWrapper);
            docWrapper.put("@class", TYPE);
        }
        docWrapper.put(FIELD_DOCUMENT_TYPE, docType);
        docWrapper.put(FIELD_CATEGORY, isAddress ? "address" : "data");
        docWrapper.withArray(FIELD_ARCHIVE).removeAll();

        JsonNode draft = docWrapper.get(FIELD_DRAFT);
        JsonNode published = docWrapper.get(FIELD_PUBLISHED);
        if (draft != null && draft.textValue().equals(recordId)) {
            docWrapper.put(FIELD_DRAFT, newRecordId);
        } else if (published != null && published.textValue().equals(recordId)){
            docWrapper.put(FIELD_PUBLISHED, newRecordId);
        } else {
            log.error("Could not find reference of: " + recordId);
            return;
        }

        try {
            dbService.save(TYPE, isAddress ? null : docWrapper.get("@rid").asText(), docWrapper.toString());
        } catch (ApiException e) {
            log.error("Error migrating document", e);
        }

    }

    /**
     * Add TestDoc class to databases that is using them
     *
     * @param database
     */
    private void addTestDocClass(String database) {

        try (ODatabaseSession session = dbService.acquire(database)) {
            List<JsonNode> docs = dbService.findAll("TestDoc");
            if (docs == null) {
                new TestType().initialize(session);
            }
        }

    }

    private void addDocumentClass(String database) {

        try (ODatabaseSession session = dbService.acquire(database)) {
            List<JsonNode> docs = dbService.findAll("Document");
            if (docs == null) {
                new DocumentType().initialize(session);
            }
        }

    }

}
