package de.ingrid.igeserver.imports.internal;

import com.fasterxml.jackson.databind.JsonNode;
import de.ingrid.ige.api.IgeImporter;
import de.ingrid.igeserver.services.MapperService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class InternalImporter implements IgeImporter {

    private static Logger log = LogManager.getLogger(InternalImporter.class);

    @Override
    public JsonNode run(Object data) {
        try {
            return MapperService.getJsonNode((String) data);
        } catch (Exception e) {
            log.error("Error during conversion of document to JsonNode", e);
        }
        return null;
    }

    @Override
    public boolean canHandleImportFile(String contentType, String fileContent) {
        boolean isJson = "application/json".equals(contentType) || "text/plain".equals(contentType);
        boolean hasNecessaryFields = fileContent.contains("\"_id\"") && fileContent.contains("\"_profile\"") && fileContent.contains("\"_state\"");

        return isJson && hasNecessaryFields;
    }

    @Override
    public String getName() {
        return "Internes Format";
    }
}
