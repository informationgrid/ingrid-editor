package de.ingrid.igeserver.migrations;

import com.fasterxml.jackson.databind.JsonNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.documenttypes.OrganizationType;
import de.ingrid.igeserver.profiles.TestType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;

@Service
public class Migration {

    @Autowired
    private DBApi dbService;

    @PostConstruct
    public void init() {

        update();

    }

    private void update() {

        String[] databases = this.dbService.getDatabases();

        for (String database : databases) {
            addTestDocClass(database);
            addOrganizationClass(database);
        }

    }

    /**
     * Add TestDoc class to databases that is using them
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
