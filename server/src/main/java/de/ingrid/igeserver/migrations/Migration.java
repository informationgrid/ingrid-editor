package de.ingrid.igeserver.migrations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.documenttypes.OrganizationType;
import de.ingrid.igeserver.profiles.TestType;
import de.ingrid.igeserver.services.MapperService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;

@Service
public class Migration {

    private static final Logger log = LogManager.getLogger(Migration.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    List<DocumentType> documentTypes;

    private int migratedDocs = 0;

    @PostConstruct
    public void init() {

        update();

    }

    private void update() {

        String[] databases = this.dbService.getDatabases();

        for (String database : databases) {
            addTestDocClass(database);
//            addOrganizationClass(database);
            migrateProfileToDoctypes(database);
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

    public void handleDoctypeMigration(DocumentType type, JsonNode doc) {

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

    /**
     * Add TestDoc class to databases that is using them
     *
     * @param database
     */
    private void addOrganizationClass(String database) {

        try (ODatabaseSession session = dbService.acquire(database)) {
            List<JsonNode> docs = dbService.findAll("OrganizationDoc");
            if (docs == null) {
                new OrganizationType().initialize(session);
            }
        }

    }
}
