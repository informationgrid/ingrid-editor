package de.ingrid.igeserver.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.exception.OStorageException;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.*;
import de.ingrid.igeserver.exceptions.DatabaseDoesNotExistException;
import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.services.MapperService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DBUtils {

    private static Logger log = LogManager.getLogger(DBUtils.class);

    private final DBApi dbService;

    @Autowired
    public DBUtils(DBApi dbService) {
        this.dbService = dbService;
    }

    public String getCurrentCatalogForUser(String userId) {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        // TODO: use cache!
        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = false;
            DBFindAllResults list = this.dbService.findAll("Info", query, findOptions);

            if (list.totalHits == 0) {
                String msg = "The user does not seem to be assigned to any database: " + userId;
                log.error(msg);
            }

            // TODO: can this exception be thrown? what about size check above?
            JsonNode catInfo = list.hits.stream()
                    .findFirst()
                    .orElseThrow(() -> new ApiException(500, "No catalog Info found"));

            String currentCatalogId = catInfo.has("currentCatalogId") ? catInfo.get("currentCatalogId").asText() : null;
            if (currentCatalogId == null || currentCatalogId.trim().equals("")) {
                ArrayNode catalogIds = (ArrayNode) catInfo.get("catalogIds");
                if (catalogIds.size() > 0) {
                    currentCatalogId = catalogIds.get(0).asText();
                }
            }
            return currentCatalogId;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Set<String> getCatalogsForUser(String userId) {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        // TODO: use cache!
        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = false;
            DBFindAllResults list = this.dbService.findAll("Info", query, findOptions);

            if (list.totalHits == 0) {
                String msg = "The user does not seem to be assigned to any database: " + userId;
                log.error(msg);
                // throw new ApiException(500, "User has no assigned catalog");
            }

            if (list.totalHits == 0) {
                return new HashSet<>();
            } else {
                JsonNode map = list.hits.get(0);
                ArrayNode catalogIdsArray = (ArrayNode) map.get("catalogIds");
                Set<String> catalogIds = new HashSet<>();
                for (JsonNode jsonNode : catalogIdsArray) {
                    catalogIds.add(jsonNode.asText());
                }
                return catalogIds;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new HashSet<>();
        }
    }

    public Catalog getCatalogById(String id) {
        try (ODatabaseSession ignored = this.dbService.acquire(id)) {
            List<JsonNode> catalogInfo = this.dbService.findAll(DBApi.DBClass.Info.name());

            // TODO: can this happen?
            if (catalogInfo == null || catalogInfo.size() == 0) return null;

            Catalog catalog = new Catalog();
            catalog.id = id;
            JsonNode jsonNode = catalogInfo.get(0);
            catalog.name = jsonNode.get("name").asText();
            catalog.description = jsonNode.has("description") ? jsonNode.get("description").asText() : "";
            catalog.type = jsonNode.get("type").asText();
            return catalog;
        } catch (OStorageException ex) {
            // in case catalog has been deleted but reference is still there
            // TODO: remove reference from user to deleted catalogs
            log.error("User probably has deleted catalog reference", ex);
            return null;
        } catch (DatabaseDoesNotExistException ex) {
            log.error("The database does not exist: " + ex.getMessage());
            return null;
        }
    }

    public static String toJsonString(Object map) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        return mapper.writeValueAsString(map);
    }

    public void setCatalogIdsForUser(String userId, Set<String> assignedCatalogs) {
        Map<String, String> query = new HashMap<>();
        query.put("userId", userId);

        try (ODatabaseSession ignored = this.dbService.acquire("IgeUsers")) {
            FindOptions findOptions = new FindOptions();
            findOptions.queryType = QueryType.exact;
            findOptions.resolveReferences = false;
            DBFindAllResults list = this.dbService.findAll("Info", query, findOptions);

            ObjectNode catUserRef = (ObjectNode) list.hits.get(0);
            catUserRef.putPOJO("catalogIds", assignedCatalogs);
            String id = catUserRef.get(OrientDBDatabase.DB_ID).asText();
            MapperService.removeDBManagementFields(catUserRef);

            this.dbService.save("Info", id, catUserRef.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
