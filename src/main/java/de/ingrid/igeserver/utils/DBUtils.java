package de.ingrid.igeserver.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.db.record.OTrackedSet;
import com.orientechnologies.orient.core.exception.OStorageException;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.services.MapperService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class DBUtils {

    private static Logger log = LogManager.getLogger(DBUtils.class);

    private final DBApi dbService;

    @Autowired
    public DBUtils(DBApi dbService) {
        this.dbService = dbService;
    }

    public String getCurrentCatalogForUser(String userId) throws ApiException {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        // TODO: use cache!
        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            List<Map> list = this.dbService.findAll(DBApi.DBClass.Info, query, true);

            if (list.size() == 0) {
                String msg = "The user does not seem to be assigned to any database: " + userId;
                log.error(msg);
            }

            // TODO: can this exception be thrown? what about size check above?
            Map catInfo = list.stream()
                    .findFirst()
                    .orElseThrow(() -> new ApiException(500, "No catalog Info found"));

            String currentCatalogId = (String) catInfo.get("currentCatalogId");
            if (currentCatalogId == null) {
                Object[] catalogIds = ((OTrackedSet) catInfo.get("catalogIds")).toArray();
                if (catalogIds.length > 0) {
                    currentCatalogId = (String) catalogIds[0];
                }
            }
            return currentCatalogId;
        }
    }

    public Set<String> getCatalogsForUser(String userId) throws ApiException {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        // TODO: use cache!
        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            List<Map> list = this.dbService.findAll(DBApi.DBClass.Info, query, true);

            if (list.size() == 0) {
                String msg = "The user does not seem to be assigned to any database: " + userId;
                log.error(msg);
                // throw new ApiException(500, "User has no assigned catalog");
            }

            // return (Set<String>) list.get(0).get("catalogIds");
            return list.size() == 0 ? new HashSet<>() : (Set<String>) list.get(0).get("catalogIds");
        }
    }

    public Catalog getCatalogById(String id) throws ApiException {
        try (ODatabaseSession ignored = this.dbService.acquire(id)) {
            List<Map> catalogInfo = this.dbService.findAll(DBApi.DBClass.Info);

            // TODO: can this happen?
            if (catalogInfo == null || catalogInfo.size() == 0) return null;

            Catalog catalog = new Catalog();
            catalog.id = id;
            catalog.name = (String) catalogInfo.get(0).get("name");
            return catalog;
        } catch (OStorageException ex) {
            // in case catalog has been deleted but reference is still there
            // TODO: remove reference from user to deleted catalogs
            log.error("User probably has deleted catalog reference", ex);
            return null;
        }
    }

    public String[] getReferencedDocs(Map mapDoc) {
        List<String> refNodes = new ArrayList<>();

        String profile = (String) mapDoc.get(MapperService.FIELD_PROFILE);

        // TODO: make it dynamic
        if ("UVP".equals(profile)) {

            // TODO: use Info map for each document type, which references it has and receive reference Id
            Map publisher = (Map) mapDoc.get("publisher");

            if (publisher != null) {
                String refId = (String) publisher.get(MapperService.FIELD_ID);

                // TODO: get referenced document in a loop
                Map refJson = this.dbService.find(DBApi.DBClass.Documents, refId);

                // TODO: map to json string
                refNodes.add(refJson.toString());
            }
        }

        return refNodes.toArray(new String[0]);
    }

    public Map<String, Object> getMapFromObject(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        // return mapper.valueToTree(object);
        try {
            if (object instanceof String) {
                return mapper.readValue((String) object, HashMap.class);
            } else {
                return  mapper.convertValue(object, HashMap.class);
            }
        } catch (IOException e) {
            log.error(e);
            return null;
        }
    }

    public String toJsonString(Object map) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.writeValueAsString(map);
    }

    public void setCatalogIdsForUser(String userId, Set<String> assignedCatalogs) throws ApiException {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            List<Map> list = this.dbService.findAll(DBApi.DBClass.Info, query, true);

            Map<String, Object> catUserRef = list.get(0);
            catUserRef.put("catalogIds", assignedCatalogs);

            this.dbService.save(DBApi.DBClass.Info, "IGNORE", catUserRef);
        }
    }
}
